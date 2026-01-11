/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, frameworkTypeOptions, frameworkStatusOptions } from '../../utils';

export const frameworkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['framework'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a framework by ID',
				action: 'Get a framework',
			},
			{
				name: 'Get Compliance Score',
				value: 'getComplianceScore',
				description: 'Get compliance score for a framework',
				action: 'Get compliance score',
			},
			{
				name: 'Get Controls',
				value: 'getControls',
				description: 'Get controls for a framework',
				action: 'Get framework controls',
			},
			{
				name: 'Get Gaps',
				value: 'getGaps',
				description: 'Get compliance gaps for a framework',
				action: 'Get compliance gaps',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get all enabled frameworks',
				action: 'Get many frameworks',
			},
		],
		default: 'getAll',
	},
];

export const frameworkFields: INodeProperties[] = [
	// Framework ID field
	{
		displayName: 'Framework ID',
		name: 'frameworkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['framework'],
				operation: ['get', 'getControls', 'getComplianceScore', 'getGaps'],
			},
		},
		default: '',
		description: 'The unique identifier of the framework',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['framework'],
				operation: ['getAll', 'getControls'],
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
				resource: ['framework'],
				operation: ['getAll', 'getControls'],
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
				resource: ['framework'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: frameworkStatusOptions,
				default: '',
				description: 'Filter by framework status',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: frameworkTypeOptions,
				default: '',
				description: 'Filter by framework type',
			},
		],
	},
];

export async function executeFrameworkOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const frameworkId = this.getNodeParameter('frameworkId', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', `/frameworks/${frameworkId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/frameworks', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/frameworks', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getControls': {
			const frameworkId = this.getNodeParameter('frameworkId', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/frameworks/${frameworkId}/controls`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/frameworks/${frameworkId}/controls`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getComplianceScore': {
			const frameworkId = this.getNodeParameter('frameworkId', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', `/frameworks/${frameworkId}/compliance-score`);
			break;
		}

		case 'getGaps': {
			const frameworkId = this.getNodeParameter('frameworkId', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', `/frameworks/${frameworkId}/gaps`);
			break;
		}
	}

	return responseData;
}
