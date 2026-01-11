/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, backgroundCheckStatusOptions, formatDateForApi } from '../../utils';

export const backgroundCheckOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a background check by ID',
				action: 'Get a background check',
			},
			{
				name: 'Get by Personnel',
				value: 'getByPersonnel',
				description: 'Get background checks for a person',
				action: 'Get background checks by personnel',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many background checks',
				action: 'Get many background checks',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update background check status',
				action: 'Update background check status',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload background check result',
				action: 'Upload background check',
			},
		],
		default: 'getAll',
	},
];

export const backgroundCheckFields: INodeProperties[] = [
	// Check ID field
	{
		displayName: 'Check ID',
		name: 'checkId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['get', 'updateStatus'],
			},
		},
		default: 0,
		description: 'The unique identifier of the background check',
	},
	// Personnel ID for getByPersonnel and upload
	{
		displayName: 'Personnel ID',
		name: 'personnelId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['getByPersonnel', 'upload'],
			},
		},
		default: 0,
		description: 'The personnel ID',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['getAll', 'getByPersonnel'],
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
				resource: ['backgroundCheck'],
				operation: ['getAll', 'getByPersonnel'],
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
				resource: ['backgroundCheck'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Personnel ID',
				name: 'personnelId',
				type: 'number',
				default: 0,
				description: 'Filter by personnel',
			},
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'string',
				default: '',
				description: 'Filter by provider name',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: backgroundCheckStatusOptions,
				default: '',
				description: 'Filter by status',
			},
		],
	},
	// Update Status fields
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['updateStatus'],
			},
		},
		options: backgroundCheckStatusOptions,
		default: 'COMPLETED',
		description: 'New status for the background check',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['updateStatus'],
			},
		},
		options: [
			{
				displayName: 'Completed Date',
				name: 'completedDate',
				type: 'dateTime',
				default: '',
				description: 'Completion date of the check',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'Expiration date of the check',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes',
			},
		],
	},
	// Upload fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['upload'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Upload Options',
		name: 'uploadOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['backgroundCheck'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Completed Date',
				name: 'completedDate',
				type: 'dateTime',
				default: '',
				description: 'Completion date of the check',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'Expiration date of the check',
			},
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'string',
				default: '',
				description: 'Background check provider name',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: backgroundCheckStatusOptions,
				default: 'COMPLETED',
				description: 'Status of the background check',
			},
		],
	},
];

export async function executeBackgroundCheckOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const checkId = this.getNodeParameter('checkId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/background-checks/${checkId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/background-checks', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/background-checks', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByPersonnel': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/personnel/${personnelId}/background-checks`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/personnel/${personnelId}/background-checks`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'updateStatus': {
			const checkId = this.getNodeParameter('checkId', i) as number;
			const status = this.getNodeParameter('status', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				status,
				...cleanObject(additionalFields),
			};

			if (body.completedDate) {
				body.completedDate = formatDateForApi(body.completedDate as string);
			}
			if (body.expirationDate) {
				body.expirationDate = formatDateForApi(body.expirationDate as string);
			}

			responseData = await drataApiRequest.call(this, 'PUT', `/background-checks/${checkId}`, body);
			break;
		}

		case 'upload': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const uploadOptions = this.getNodeParameter('uploadOptions', i) as IDataObject;

			const options = cleanObject(uploadOptions);
			if (options.completedDate) {
				options.completedDate = formatDateForApi(options.completedDate as string);
			}
			if (options.expirationDate) {
				options.expirationDate = formatDateForApi(options.expirationDate as string);
			}

			responseData = await drataUploadFile.call(
				this,
				`/personnel/${personnelId}/background-checks`,
				binaryPropertyName,
				i,
				options,
			);
			break;
		}
	}

	return responseData;
}
