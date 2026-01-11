/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, controlStatusOptions, monitoringTypeOptions } from '../../utils';

export const controlOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['control'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a control by ID',
				action: 'Get a control',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many controls',
				action: 'Get many controls',
			},
			{
				name: 'Get Evidence',
				value: 'getEvidence',
				description: 'Get evidence linked to a control',
				action: 'Get evidence for a control',
			},
			{
				name: 'Get Monitoring Status',
				value: 'getMonitoringStatus',
				description: 'Get control monitoring status',
				action: 'Get monitoring status',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a control',
				action: 'Update a control',
			},
			{
				name: 'Upload Evidence',
				value: 'uploadEvidence',
				description: 'Upload external evidence to a control',
				action: 'Upload evidence to a control',
			},
		],
		default: 'getAll',
	},
];

export const controlFields: INodeProperties[] = [
	// Control ID field
	{
		displayName: 'Control ID',
		name: 'controlId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['control'],
				operation: ['get', 'update', 'getEvidence', 'uploadEvidence', 'getMonitoringStatus'],
			},
		},
		default: 0,
		description: 'The unique identifier of the control',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['control'],
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
				resource: ['control'],
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
				resource: ['control'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Framework ID',
				name: 'frameworkId',
				type: 'string',
				default: '',
				description: 'Filter by framework ID',
			},
			{
				displayName: 'Monitoring Type',
				name: 'monitoringType',
				type: 'options',
				options: monitoringTypeOptions,
				default: '',
				description: 'Filter by monitoring type',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Filter by control owner user ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: controlStatusOptions,
				default: '',
				description: 'Filter by control status',
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
				resource: ['control'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Control description',
			},
			{
				displayName: 'Monitoring Type',
				name: 'monitoringType',
				type: 'options',
				options: monitoringTypeOptions,
				default: '',
				description: 'Type of monitoring for the control',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'User ID of the control owner',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: controlStatusOptions,
				default: '',
				description: 'Control status',
			},
		],
	},
	// Upload Evidence fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['control'],
				operation: ['uploadEvidence'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['control'],
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
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'When the evidence expires',
			},
		],
	},
];

export async function executeControlOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/controls/${controlId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/controls', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/controls', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'update': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = cleanObject(updateFields);
			responseData = await drataApiRequest.call(this, 'PUT', `/controls/${controlId}`, body);
			break;
		}

		case 'getEvidence': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			responseData = await drataApiRequestAllItems.call(this, 'GET', `/controls/${controlId}/evidence`);
			break;
		}

		case 'uploadEvidence': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
			responseData = await drataUploadFile.call(
				this,
				`/controls/${controlId}/evidence`,
				binaryPropertyName,
				i,
				cleanObject(additionalFields),
			);
			break;
		}

		case 'getMonitoringStatus': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/controls/${controlId}/monitoring-status`);
			break;
		}
	}

	return responseData;
}
