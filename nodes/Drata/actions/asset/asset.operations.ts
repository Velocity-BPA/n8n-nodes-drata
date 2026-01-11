/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, assetTypeOptions, assetStatusOptions } from '../../utils';

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new asset',
				action: 'Create an asset',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an asset',
				action: 'Delete an asset',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an asset by ID',
				action: 'Get an asset',
			},
			{
				name: 'Get Compliance Status',
				value: 'getComplianceStatus',
				description: 'Get asset compliance status',
				action: 'Get asset compliance status',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many assets',
				action: 'Get many assets',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an asset',
				action: 'Update an asset',
			},
		],
		default: 'getAll',
	},
];

export const assetFields: INodeProperties[] = [
	// Asset ID field
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['get', 'update', 'delete', 'getComplianceStatus'],
			},
		},
		default: 0,
		description: 'The unique identifier of the asset',
	},
	// Create fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Asset name',
	},
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create'],
			},
		},
		options: assetTypeOptions,
		default: 'DEVICE',
		description: 'Type of asset',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Asset description',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Asset owner user ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: assetStatusOptions,
				default: 'ACTIVE',
				description: 'Asset status',
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
				resource: ['asset'],
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
				resource: ['asset'],
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
				resource: ['asset'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Asset Type',
				name: 'assetType',
				type: 'options',
				options: assetTypeOptions,
				default: '',
				description: 'Filter by asset type',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Filter by owner',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: assetStatusOptions,
				default: '',
				description: 'Filter by status',
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
				resource: ['asset'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Asset Type',
				name: 'assetType',
				type: 'options',
				options: assetTypeOptions,
				default: '',
				description: 'Type of asset',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Asset description',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Asset name',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Asset owner user ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: assetStatusOptions,
				default: '',
				description: 'Asset status',
			},
		],
	},
];

export async function executeAssetOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', i) as string;
			const assetType = this.getNodeParameter('assetType', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				name,
				assetType,
				...cleanObject(additionalFields),
			};

			responseData = await drataApiRequest.call(this, 'POST', '/assets', body);
			break;
		}

		case 'get': {
			const assetId = this.getNodeParameter('assetId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/assets/${assetId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/assets', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/assets', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'update': {
			const assetId = this.getNodeParameter('assetId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = cleanObject(updateFields);
			responseData = await drataApiRequest.call(this, 'PUT', `/assets/${assetId}`, body);
			break;
		}

		case 'delete': {
			const assetId = this.getNodeParameter('assetId', i) as number;
			responseData = await drataApiRequest.call(this, 'DELETE', `/assets/${assetId}`);
			break;
		}

		case 'getComplianceStatus': {
			const assetId = this.getNodeParameter('assetId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/assets/${assetId}/compliance-status`);
			break;
		}
	}

	return responseData;
}
