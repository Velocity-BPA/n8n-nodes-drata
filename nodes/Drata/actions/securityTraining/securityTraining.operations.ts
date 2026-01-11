/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, trainingStatusOptions, formatDateForApi } from '../../utils';

export const securityTrainingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['securityTraining'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a training record by ID',
				action: 'Get a training record',
			},
			{
				name: 'Get by Personnel',
				value: 'getByPersonnel',
				description: 'Get training for a person',
				action: 'Get training by personnel',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many training records',
				action: 'Get many training records',
			},
			{
				name: 'Get Overdue',
				value: 'getOverdue',
				description: 'Get overdue training',
				action: 'Get overdue training',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update training status',
				action: 'Update training status',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload training completion',
				action: 'Upload training record',
			},
		],
		default: 'getAll',
	},
];

export const securityTrainingFields: INodeProperties[] = [
	// Training ID field
	{
		displayName: 'Training ID',
		name: 'trainingId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['securityTraining'],
				operation: ['get', 'updateStatus'],
			},
		},
		default: 0,
		description: 'The unique identifier of the training record',
	},
	// Personnel ID for getByPersonnel and upload
	{
		displayName: 'Personnel ID',
		name: 'personnelId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['securityTraining'],
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
				resource: ['securityTraining'],
				operation: ['getAll', 'getByPersonnel', 'getOverdue'],
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
				resource: ['securityTraining'],
				operation: ['getAll', 'getByPersonnel', 'getOverdue'],
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
				resource: ['securityTraining'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Course Name',
				name: 'courseName',
				type: 'string',
				default: '',
				description: 'Filter by course name',
			},
			{
				displayName: 'Personnel ID',
				name: 'personnelId',
				type: 'number',
				default: 0,
				description: 'Filter by personnel',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: trainingStatusOptions,
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
				resource: ['securityTraining'],
				operation: ['updateStatus'],
			},
		},
		options: trainingStatusOptions,
		default: 'COMPLETED',
		description: 'New status for the training',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['securityTraining'],
				operation: ['updateStatus'],
			},
		},
		options: [
			{
				displayName: 'Completed Date',
				name: 'completedDate',
				type: 'dateTime',
				default: '',
				description: 'Completion date of the training',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'Expiration date of the training',
			},
			{
				displayName: 'Score',
				name: 'score',
				type: 'number',
				default: 0,
				description: 'Training score/percentage',
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
				resource: ['securityTraining'],
				operation: ['upload'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Course Name',
		name: 'courseName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['securityTraining'],
				operation: ['upload'],
			},
		},
		default: '',
		description: 'Name of the training course',
	},
	{
		displayName: 'Upload Options',
		name: 'uploadOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['securityTraining'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Completed Date',
				name: 'completedDate',
				type: 'dateTime',
				default: '',
				description: 'Completion date of the training',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'Expiration date of the training',
			},
			{
				displayName: 'Score',
				name: 'score',
				type: 'number',
				default: 0,
				description: 'Training score/percentage',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: trainingStatusOptions,
				default: 'COMPLETED',
				description: 'Status of the training',
			},
		],
	},
];

export async function executeSecurityTrainingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const trainingId = this.getNodeParameter('trainingId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/security-training/${trainingId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/security-training', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/security-training', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByPersonnel': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/personnel/${personnelId}/security-training`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/personnel/${personnelId}/security-training`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getOverdue': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/security-training/overdue');
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', '/security-training/overdue', undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'updateStatus': {
			const trainingId = this.getNodeParameter('trainingId', i) as number;
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

			responseData = await drataApiRequest.call(this, 'PUT', `/security-training/${trainingId}`, body);
			break;
		}

		case 'upload': {
			const personnelId = this.getNodeParameter('personnelId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const courseName = this.getNodeParameter('courseName', i) as string;
			const uploadOptions = this.getNodeParameter('uploadOptions', i) as IDataObject;

			const options: IDataObject = {
				courseName,
				...cleanObject(uploadOptions),
			};

			if (options.completedDate) {
				options.completedDate = formatDateForApi(options.completedDate as string);
			}
			if (options.expirationDate) {
				options.expirationDate = formatDateForApi(options.expirationDate as string);
			}

			responseData = await drataUploadFile.call(
				this,
				`/personnel/${personnelId}/security-training`,
				binaryPropertyName,
				i,
				options,
			);
			break;
		}
	}

	return responseData;
}
