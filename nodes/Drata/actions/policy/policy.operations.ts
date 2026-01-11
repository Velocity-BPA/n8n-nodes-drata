/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, policyStatusOptions } from '../../utils';

export const policyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['policy'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a policy by ID',
				action: 'Get a policy',
			},
			{
				name: 'Get Acknowledgments',
				value: 'getAcknowledgments',
				description: 'Get policy acknowledgment status',
				action: 'Get policy acknowledgments',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many policies',
				action: 'Get many policies',
			},
			{
				name: 'Get Version History',
				value: 'getVersionHistory',
				description: 'Get policy version history',
				action: 'Get version history',
			},
		],
		default: 'getAll',
	},
];

export const policyFields: INodeProperties[] = [
	// Policy ID field
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['get', 'getAcknowledgments', 'getVersionHistory'],
			},
		},
		default: 0,
		description: 'The unique identifier of the policy',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['getAll', 'getAcknowledgments'],
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
				resource: ['policy'],
				operation: ['getAll', 'getAcknowledgments'],
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
				resource: ['policy'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by policy name',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: policyStatusOptions,
				default: '',
				description: 'Filter by policy status',
			},
		],
	},
];

export async function executePolicyOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const policyId = this.getNodeParameter('policyId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/policies/${policyId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/policies', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/policies', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getAcknowledgments': {
			const policyId = this.getNodeParameter('policyId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/policies/${policyId}/acknowledgments`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/policies/${policyId}/acknowledgments`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getVersionHistory': {
			const policyId = this.getNodeParameter('policyId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/policies/${policyId}/versions`);
			break;
		}
	}

	return responseData;
}
