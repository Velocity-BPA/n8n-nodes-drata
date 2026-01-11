/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, employmentTypeOptions, formatDateForApi } from '../../utils';

export const personnelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new personnel record',
				action: 'Create a personnel',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a person by ID',
				action: 'Get a personnel',
			},
			{
				name: 'Get by Email',
				value: 'getByEmail',
				description: 'Search personnel by email',
				action: 'Get personnel by email',
			},
			{
				name: 'Get Compliance Status',
				value: 'getComplianceStatus',
				description: "Get person's compliance status",
				action: 'Get compliance status',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many personnel',
				action: 'Get many personnel',
			},
			{
				name: 'Offboard',
				value: 'offboard',
				description: 'Mark person as offboarded',
				action: 'Offboard a personnel',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update personnel details',
				action: 'Update a personnel',
			},
			{
				name: 'Upload Evidence',
				value: 'uploadEvidence',
				description: 'Upload compliance evidence for a person',
				action: 'Upload evidence for a personnel',
			},
		],
		default: 'getAll',
	},
];

export const personnelFields: INodeProperties[] = [
	// Personnel ID field
	{
		displayName: 'Personnel ID',
		name: 'personnelId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['get', 'update', 'offboard', 'uploadEvidence', 'getComplianceStatus'],
			},
		},
		default: 0,
		description: 'The unique identifier of the person',
	},
	// Email field for getByEmail
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['getByEmail'],
			},
		},
		default: '',
		description: "Person's email address",
	},
	// Create fields
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['create'],
			},
		},
		default: '',
		description: "Person's email address",
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['create'],
			},
		},
		default: '',
		description: "Person's first name",
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['create'],
			},
		},
		default: '',
		description: "Person's last name",
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Employment Type',
				name: 'employmentType',
				type: 'options',
				options: employmentTypeOptions,
				default: 'EMPLOYEE',
				description: 'Type of employment',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Employment start date',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Job title',
			},
		],
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Filter by department',
			},
			{
				displayName: 'Employment Type',
				name: 'employmentType',
				type: 'options',
				options: employmentTypeOptions,
				default: '',
				description: 'Filter by employment type',
			},
		],
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Employment Type',
				name: 'employmentType',
				type: 'options',
				options: employmentTypeOptions,
				default: '',
				description: 'Type of employment',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'First name',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Last name',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Job title',
			},
		],
	},
	// Offboard fields
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['offboard'],
			},
		},
		default: '',
		description: 'Employment end date',
	},
	// Upload Evidence fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['uploadEvidence'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Evidence Options',
		name: 'evidenceOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['personnel'],
				operation: ['uploadEvidence'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the evidence',
			},
			{
				displayName: 'Evidence Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Background Check', value: 'BACKGROUND_CHECK' },
					{ name: 'Custom', value: 'CUSTOM' },
					{ name: 'MDM Compliance', value: 'MDM_COMPLIANCE' },
					{ name: 'Policy Acknowledgment', value: 'POLICY_ACKNOWLEDGMENT' },
					{ name: 'Security Training', value: 'SEC_TRAINING' },
				],
				default: 'CUSTOM',
				description: 'Type of evidence',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'When the evidence expires',
			},
		],
	},
];

export async function executePersonnelOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'create': {
			const email = this.getNodeParameter('email', i) as string;
			const firstName = this.getNodeParameter('firstName', i) as string;
			const lastName = this.getNodeParameter('lastName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				email,
				firstName,
				lastName,
				...cleanObject(additionalFields),
			};

			if (body.startDate) {
				body.startDate = formatDateForApi(body.startDate as string);
			}

			responseData = await drataApiRequest.call(this, 'POST', '/personnel', body);
			break;
		}

		case 'get': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/personnel/${personnelId}`);
			break;
		}

		case 'getByEmail': {
			const email = this.getNodeParameter('email', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', '/personnel', undefined, { email });
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/personnel', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/personnel', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'update': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = cleanObject(updateFields);
			responseData = await drataApiRequest.call(this, 'PUT', `/personnel/${personnelId}`, body);
			break;
		}

		case 'offboard': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const body: IDataObject = {
				endDate: formatDateForApi(endDate),
			};
			responseData = await drataApiRequest.call(this, 'PUT', `/personnel/${personnelId}/offboard`, body);
			break;
		}

		case 'uploadEvidence': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const evidenceOptions = this.getNodeParameter('evidenceOptions', i) as IDataObject;
			responseData = await drataUploadFile.call(
				this,
				`/personnel/${personnelId}/evidence`,
				binaryPropertyName,
				i,
				cleanObject(evidenceOptions),
			);
			break;
		}

		case 'getComplianceStatus': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/personnel/${personnelId}/compliance-status`);
			break;
		}
	}

	return responseData;
}
