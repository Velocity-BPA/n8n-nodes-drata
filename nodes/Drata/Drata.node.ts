/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

// Import all resource operations and fields
import { controlOperations, controlFields, executeControlOperation } from './actions/control';
import { personnelOperations, personnelFields, executePersonnelOperation } from './actions/personnel';
import { assetOperations, assetFields, executeAssetOperation } from './actions/asset';
import { vendorOperations, vendorFields, executeVendorOperation } from './actions/vendor';
import { evidenceOperations, evidenceFields, executeEvidenceOperation } from './actions/evidence';
import { frameworkOperations, frameworkFields, executeFrameworkOperation } from './actions/framework';
import { riskOperations, riskFields, executeRiskOperation } from './actions/risk';
import { policyOperations, policyFields, executePolicyOperation } from './actions/policy';
import { userOperations, userFields, executeUserOperation } from './actions/user';
import {
	backgroundCheckOperations,
	backgroundCheckFields,
	executeBackgroundCheckOperation,
} from './actions/backgroundCheck';
import {
	securityTrainingOperations,
	securityTrainingFields,
	executeSecurityTrainingOperation,
} from './actions/securityTraining';
import {
	auditEventOperations,
	auditEventFields,
	executeAuditEventOperation,
} from './actions/auditEvent';

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

export class Drata implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Drata',
		name: 'drata',
		icon: 'file:drata.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Drata compliance automation API',
		defaults: {
			name: 'Drata',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'drataApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Asset',
						value: 'asset',
					},
					{
						name: 'Audit Event',
						value: 'auditEvent',
					},
					{
						name: 'Background Check',
						value: 'backgroundCheck',
					},
					{
						name: 'Control',
						value: 'control',
					},
					{
						name: 'Evidence',
						value: 'evidence',
					},
					{
						name: 'Framework',
						value: 'framework',
					},
					{
						name: 'Personnel',
						value: 'personnel',
					},
					{
						name: 'Policy',
						value: 'policy',
					},
					{
						name: 'Risk',
						value: 'risk',
					},
					{
						name: 'Security Training',
						value: 'securityTraining',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Vendor',
						value: 'vendor',
					},
				],
				default: 'control',
			},
			// Control operations and fields
			...controlOperations,
			...controlFields,
			// Personnel operations and fields
			...personnelOperations,
			...personnelFields,
			// Asset operations and fields
			...assetOperations,
			...assetFields,
			// Vendor operations and fields
			...vendorOperations,
			...vendorFields,
			// Evidence operations and fields
			...evidenceOperations,
			...evidenceFields,
			// Framework operations and fields
			...frameworkOperations,
			...frameworkFields,
			// Risk operations and fields
			...riskOperations,
			...riskFields,
			// Policy operations and fields
			...policyOperations,
			...policyFields,
			// User operations and fields
			...userOperations,
			...userFields,
			// Background Check operations and fields
			...backgroundCheckOperations,
			...backgroundCheckFields,
			// Security Training operations and fields
			...securityTrainingOperations,
			...securityTrainingFields,
			// Audit Event operations and fields
			...auditEventOperations,
			...auditEventFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		emitLicenseNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				switch (resource) {
					case 'control':
						responseData = await executeControlOperation.call(this, operation, i);
						break;
					case 'personnel':
						responseData = await executePersonnelOperation.call(this, operation, i);
						break;
					case 'asset':
						responseData = await executeAssetOperation.call(this, operation, i);
						break;
					case 'vendor':
						responseData = await executeVendorOperation.call(this, operation, i);
						break;
					case 'evidence':
						responseData = await executeEvidenceOperation.call(this, operation, i);
						break;
					case 'framework':
						responseData = await executeFrameworkOperation.call(this, operation, i);
						break;
					case 'risk':
						responseData = await executeRiskOperation.call(this, operation, i);
						break;
					case 'policy':
						responseData = await executePolicyOperation.call(this, operation, i);
						break;
					case 'user':
						responseData = await executeUserOperation.call(this, operation, i);
						break;
					case 'backgroundCheck':
						responseData = await executeBackgroundCheckOperation.call(this, operation, i);
						break;
					case 'securityTraining':
						responseData = await executeSecurityTrainingOperation.call(this, operation, i);
						break;
					case 'auditEvent':
						responseData = await executeAuditEventOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
