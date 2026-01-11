/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, riskCategoryOptions, riskLikelihoodOptions, riskImpactOptions, riskStatusOptions } from '../../utils';

export const riskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['risk'],
			},
		},
		options: [
			{
				name: 'Add Mitigation',
				value: 'addMitigation',
				description: 'Add a mitigation plan to a risk',
				action: 'Add mitigation plan',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new risk',
				action: 'Create a risk',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a risk',
				action: 'Delete a risk',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a risk by ID',
				action: 'Get a risk',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many risks',
				action: 'Get many risks',
			},
			{
				name: 'Link Control',
				value: 'linkControl',
				description: 'Link a risk to a control',
				action: 'Link risk to control',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a risk',
				action: 'Update a risk',
			},
		],
		default: 'getAll',
	},
];

export const riskFields: INodeProperties[] = [
	// Risk ID field
	{
		displayName: 'Risk ID',
		name: 'riskId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['get', 'update', 'delete', 'addMitigation', 'linkControl'],
			},
		},
		default: 0,
		description: 'The unique identifier of the risk',
	},
	// Create fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Risk title',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: riskCategoryOptions,
				default: 'OPERATIONAL',
				description: 'Risk category',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Risk description',
			},
			{
				displayName: 'Impact',
				name: 'impact',
				type: 'options',
				options: riskImpactOptions,
				default: 'MODERATE',
				description: 'Risk impact level',
			},
			{
				displayName: 'Likelihood',
				name: 'likelihood',
				type: 'options',
				options: riskLikelihoodOptions,
				default: 'POSSIBLE',
				description: 'Risk likelihood',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Risk owner user ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: riskStatusOptions,
				default: 'IDENTIFIED',
				description: 'Risk status',
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
				resource: ['risk'],
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
				resource: ['risk'],
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
				resource: ['risk'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: riskCategoryOptions,
				default: '',
				description: 'Filter by category',
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
				options: riskStatusOptions,
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
				resource: ['risk'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: riskCategoryOptions,
				default: '',
				description: 'Risk category',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Risk description',
			},
			{
				displayName: 'Impact',
				name: 'impact',
				type: 'options',
				options: riskImpactOptions,
				default: '',
				description: 'Risk impact level',
			},
			{
				displayName: 'Likelihood',
				name: 'likelihood',
				type: 'options',
				options: riskLikelihoodOptions,
				default: '',
				description: 'Risk likelihood',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'Risk owner user ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: riskStatusOptions,
				default: '',
				description: 'Risk status',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Risk title',
			},
		],
	},
	// Add Mitigation fields
	{
		displayName: 'Mitigation Plan',
		name: 'mitigationPlan',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['addMitigation'],
			},
		},
		default: '',
		description: 'Description of the mitigation plan',
	},
	{
		displayName: 'Mitigation Options',
		name: 'mitigationOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['addMitigation'],
			},
		},
		options: [
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'Due date for the mitigation',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'number',
				default: 0,
				description: 'User ID of the mitigation owner',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Low', value: 'LOW' },
					{ name: 'Medium', value: 'MEDIUM' },
					{ name: 'High', value: 'HIGH' },
				],
				default: 'MEDIUM',
				description: 'Mitigation priority',
			},
		],
	},
	// Link Control fields
	{
		displayName: 'Control ID',
		name: 'controlId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['risk'],
				operation: ['linkControl'],
			},
		},
		default: 0,
		description: 'The control to link to this risk',
	},
];

export async function executeRiskOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'create': {
			const title = this.getNodeParameter('title', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				title,
				...cleanObject(additionalFields),
			};

			responseData = await drataApiRequest.call(this, 'POST', '/risks', body);
			break;
		}

		case 'get': {
			const riskId = this.getNodeParameter('riskId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/risks/${riskId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/risks', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/risks', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'update': {
			const riskId = this.getNodeParameter('riskId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = cleanObject(updateFields);
			responseData = await drataApiRequest.call(this, 'PUT', `/risks/${riskId}`, body);
			break;
		}

		case 'delete': {
			const riskId = this.getNodeParameter('riskId', i) as number;
			responseData = await drataApiRequest.call(this, 'DELETE', `/risks/${riskId}`);
			break;
		}

		case 'addMitigation': {
			const riskId = this.getNodeParameter('riskId', i) as number;
			const mitigationPlan = this.getNodeParameter('mitigationPlan', i) as string;
			const mitigationOptions = this.getNodeParameter('mitigationOptions', i) as IDataObject;

			const body: IDataObject = {
				plan: mitigationPlan,
				...cleanObject(mitigationOptions),
			};

			responseData = await drataApiRequest.call(this, 'POST', `/risks/${riskId}/mitigations`, body);
			break;
		}

		case 'linkControl': {
			const riskId = this.getNodeParameter('riskId', i) as number;
			const controlId = this.getNodeParameter('controlId', i) as number;
			responseData = await drataApiRequest.call(this, 'POST', `/risks/${riskId}/controls/${controlId}`);
			break;
		}
	}

	return responseData;
}
