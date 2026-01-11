/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from './transport';

// Emit licensing notice once at module load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeEmitted = false;
function emitLicenseNotice(): void {
	if (!licenseNoticeEmitted) {
		console.warn(LICENSING_NOTICE);
		licenseNoticeEmitted = true;
	}
}

// Helper functions for polling
async function pollControlStatusChanges(
	context: IPollFunctions,
	lastPollTime: string,
	options: IDataObject,
): Promise<IDataObject[]> {
	const query: IDataObject = {
		updatedAfter: lastPollTime,
	};

	if (options.frameworkId) {
		query.frameworkId = options.frameworkId;
	}

	const controls = await drataApiRequestAllItems.call(context, 'GET', '/controls', undefined, query);

	// Filter for status changes
	const changedControls = controls.filter((control) => {
		const updatedAt = new Date(control.updatedAt as string);
		return updatedAt > new Date(lastPollTime);
	});

	return changedControls.map((control) => ({
		eventType: 'controlStatusChanged',
		controlId: control.id,
		controlName: control.name,
		status: control.status,
		previousStatus: control.previousStatus,
		updatedAt: control.updatedAt,
		...(options.includeDetails ? { details: control } : {}),
	}));
}

async function pollPersonnelComplianceChanges(
	context: IPollFunctions,
	lastPollTime: string,
	options: IDataObject,
): Promise<IDataObject[]> {
	const personnel = await drataApiRequestAllItems.call(context, 'GET', '/personnel', undefined, {
		updatedAfter: lastPollTime,
	});

	const changedPersonnel = personnel.filter((person) => {
		const updatedAt = new Date(person.updatedAt as string);
		return updatedAt > new Date(lastPollTime);
	});

	return changedPersonnel.map((person) => ({
		eventType: 'personnelComplianceChanged',
		personnelId: person.id,
		email: person.email,
		name: `${person.firstName} ${person.lastName}`,
		complianceStatus: person.complianceStatus,
		updatedAt: person.updatedAt,
		...(options.includeDetails ? { details: person } : {}),
	}));
}

async function pollExpiringEvidence(
	context: IPollFunctions,
	options: IDataObject,
): Promise<IDataObject[]> {
	const daysBeforeExpiry = (options.daysBeforeExpiry as number) || 30;
	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

	const evidence = await drataApiRequestAllItems.call(context, 'GET', '/evidence', undefined, {
		expiringBefore: expiryDate.toISOString(),
	});

	return evidence.map((item) => ({
		eventType: 'evidenceExpiring',
		evidenceId: item.id,
		fileName: item.fileName,
		type: item.type,
		expirationDate: item.expirationDate,
		controlId: item.controlId,
		daysUntilExpiry: Math.ceil(
			(new Date(item.expirationDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
		),
		...(options.includeDetails ? { details: item } : {}),
	}));
}

async function pollVendorRiskChanges(
	context: IPollFunctions,
	lastPollTime: string,
	options: IDataObject,
): Promise<IDataObject[]> {
	const vendors = await drataApiRequestAllItems.call(context, 'GET', '/vendors', undefined, {
		updatedAfter: lastPollTime,
	});

	const changedVendors = vendors.filter((vendor) => {
		const updatedAt = new Date(vendor.updatedAt as string);
		return updatedAt > new Date(lastPollTime);
	});

	return changedVendors.map((vendor) => ({
		eventType: 'vendorRiskChanged',
		vendorId: vendor.id,
		vendorName: vendor.name,
		riskRating: vendor.riskRating,
		previousRiskRating: vendor.previousRiskRating,
		updatedAt: vendor.updatedAt,
		...(options.includeDetails ? { details: vendor } : {}),
	}));
}

async function pollOverdueTraining(
	context: IPollFunctions,
	options: IDataObject,
): Promise<IDataObject[]> {
	const training = await drataApiRequestAllItems.call(context, 'GET', '/security-training', undefined, {
		status: 'OVERDUE',
	});

	return training.map((item) => ({
		eventType: 'trainingOverdue',
		trainingId: item.id,
		personnelId: item.personnelId,
		courseName: item.courseName,
		dueDate: item.dueDate,
		status: item.status,
		...(options.includeDetails ? { details: item } : {}),
	}));
}

async function pollExpiringBackgroundChecks(
	context: IPollFunctions,
	options: IDataObject,
): Promise<IDataObject[]> {
	const daysBeforeExpiry = (options.daysBeforeExpiry as number) || 30;
	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

	const checks = await drataApiRequestAllItems.call(context, 'GET', '/background-checks', undefined, {
		expiringBefore: expiryDate.toISOString(),
	});

	return checks.map((check) => ({
		eventType: 'backgroundCheckExpiring',
		checkId: check.id,
		personnelId: check.personnelId,
		provider: check.provider,
		expirationDate: check.expirationDate,
		daysUntilExpiry: Math.ceil(
			(new Date(check.expirationDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
		),
		...(options.includeDetails ? { details: check } : {}),
	}));
}

async function pollPendingPolicyAcknowledgments(
	context: IPollFunctions,
	options: IDataObject,
): Promise<IDataObject[]> {
	const policies = await drataApiRequestAllItems.call(context, 'GET', '/policies');

	const pendingAcknowledgments: IDataObject[] = [];

	for (const policy of policies) {
		try {
			const response = (await drataApiRequest.call(
				context,
				'GET',
				`/policies/${policy.id}/acknowledgments`,
				undefined,
				{ status: 'PENDING' },
			)) as IDataObject;

			const acknowledgments = (response.data as IDataObject[]) || [];

			for (const ack of acknowledgments) {
				pendingAcknowledgments.push({
					eventType: 'policyAcknowledgmentPending',
					policyId: policy.id,
					policyName: policy.name,
					personnelId: ack.personnelId,
					requestedAt: ack.requestedAt,
					...(options.includeDetails ? { policyDetails: policy, acknowledgmentDetails: ack } : {}),
				});
			}
		} catch {
			// Skip policies we can't access
			continue;
		}
	}

	return pendingAcknowledgments;
}

async function pollAuditEvents(
	context: IPollFunctions,
	lastPollTime: string,
	options: IDataObject,
): Promise<IDataObject[]> {
	const events = await drataApiRequestAllItems.call(context, 'GET', '/audit-events', undefined, {
		after: lastPollTime,
	});

	return events.map((event) => ({
		eventType: 'auditEventCreated',
		eventId: event.id,
		entityType: event.entityType,
		entityId: event.entityId,
		action: event.action,
		userId: event.userId,
		timestamp: event.timestamp,
		...(options.includeDetails ? { details: event } : {}),
	}));
}

export class DrataTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Drata Trigger',
		name: 'drataTrigger',
		icon: 'file:drata.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows based on Drata compliance events',
		defaults: {
			name: 'Drata Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'drataApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'controlStatusChanged',
				options: [
					{
						name: 'Audit Event Created',
						value: 'auditEventCreated',
						description: 'When a significant audit event occurs',
					},
					{
						name: 'Background Check Expiring',
						value: 'backgroundCheckExpiring',
						description: 'When background check expires soon',
					},
					{
						name: 'Control Status Changed',
						value: 'controlStatusChanged',
						description: 'When control status changes',
					},
					{
						name: 'Evidence Expiring',
						value: 'evidenceExpiring',
						description: 'When evidence is approaching expiration',
					},
					{
						name: 'Personnel Compliance Changed',
						value: 'personnelComplianceChanged',
						description: "When a person's compliance status changes",
					},
					{
						name: 'Policy Acknowledgment Pending',
						value: 'policyAcknowledgmentPending',
						description: 'When policy needs acknowledgment',
					},
					{
						name: 'Training Overdue',
						value: 'trainingOverdue',
						description: 'When training becomes overdue',
					},
					{
						name: 'Vendor Risk Changed',
						value: 'vendorRiskChanged',
						description: 'When vendor risk rating changes',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Days Before Expiry',
						name: 'daysBeforeExpiry',
						type: 'number',
						default: 30,
						description: 'Number of days before expiry to trigger (for expiration events)',
						displayOptions: {
							show: {
								'/event': [
									'evidenceExpiring',
									'backgroundCheckExpiring',
								],
							},
						},
					},
					{
						displayName: 'Framework ID',
						name: 'frameworkId',
						type: 'string',
						default: '',
						description: 'Filter by specific framework',
						displayOptions: {
							show: {
								'/event': ['controlStatusChanged'],
							},
						},
					},
					{
						displayName: 'Include Details',
						name: 'includeDetails',
						type: 'boolean',
						default: true,
						description: 'Whether to include full entity details in the output',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		emitLicenseNotice();

		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const webhookData = this.getWorkflowStaticData('node');

		// Get the last poll time or set to 24 hours ago
		const lastPollTime = (webhookData.lastPollTime as string) || new Date(Date.now() - 86400000).toISOString();
		const now = new Date().toISOString();

		let items: IDataObject[] = [];

		try {
			switch (event) {
				case 'controlStatusChanged':
					items = await pollControlStatusChanges(this, lastPollTime, options);
					break;
				case 'personnelComplianceChanged':
					items = await pollPersonnelComplianceChanges(this, lastPollTime, options);
					break;
				case 'evidenceExpiring':
					items = await pollExpiringEvidence(this, options);
					break;
				case 'vendorRiskChanged':
					items = await pollVendorRiskChanges(this, lastPollTime, options);
					break;
				case 'trainingOverdue':
					items = await pollOverdueTraining(this, options);
					break;
				case 'backgroundCheckExpiring':
					items = await pollExpiringBackgroundChecks(this, options);
					break;
				case 'policyAcknowledgmentPending':
					items = await pollPendingPolicyAcknowledgments(this, options);
					break;
				case 'auditEventCreated':
					items = await pollAuditEvents(this, lastPollTime, options);
					break;
			}
		} catch (error) {
			// If there's an API error, just return empty to avoid breaking the workflow
			console.error(`Drata Trigger error for event ${event}:`, (error as Error).message);
			items = [];
		}

		// Update the last poll time
		webhookData.lastPollTime = now;

		if (items.length === 0) {
			return null;
		}

		return [items.map((item) => ({ json: item }))];
	}
}
