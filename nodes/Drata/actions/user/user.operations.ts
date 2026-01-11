/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, userRoleOptions, userStatusOptions } from '../../utils';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a user by ID',
				action: 'Get a user',
			},
			{
				name: 'Get Activity',
				value: 'getActivity',
				description: 'Get user activity log',
				action: 'Get user activity',
			},
			{
				name: 'Get by Email',
				value: 'getByEmail',
				description: 'Find user by email',
				action: 'Get user by email',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many users',
				action: 'Get many users',
			},
			{
				name: 'Get Roles',
				value: 'getRoles',
				description: 'Get user roles and permissions',
				action: 'Get user roles',
			},
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	// User ID field
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get', 'getRoles', 'getActivity'],
			},
		},
		default: 0,
		description: 'The unique identifier of the user',
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
				resource: ['user'],
				operation: ['getByEmail'],
			},
		},
		default: '',
		description: "User's email address",
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getAll', 'getActivity'],
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
				resource: ['user'],
				operation: ['getAll', 'getActivity'],
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
				resource: ['user'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: userRoleOptions,
				default: '',
				description: 'Filter by role',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: userStatusOptions,
				default: '',
				description: 'Filter by status',
			},
		],
	},
];

export async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const userId = this.getNodeParameter('userId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/users/${userId}`);
			break;
		}

		case 'getByEmail': {
			const email = this.getNodeParameter('email', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', '/users', undefined, { email });
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/users', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/users', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getRoles': {
			const userId = this.getNodeParameter('userId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/users/${userId}/roles`);
			break;
		}

		case 'getActivity': {
			const userId = this.getNodeParameter('userId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/users/${userId}/activity`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/users/${userId}/activity`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}
	}

	return responseData;
}
