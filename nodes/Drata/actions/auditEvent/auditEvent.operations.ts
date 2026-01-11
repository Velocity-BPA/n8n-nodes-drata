/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems } from '../../transport';
import { cleanObject, auditEntityTypeOptions, auditActionOptions, toIsoDate } from '../../utils';

export const auditEventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get an audit event by ID',
				action: 'Get an audit event',
			},
			{
				name: 'Get by Date Range',
				value: 'getByDateRange',
				description: 'Get events within date range',
				action: 'Get events by date range',
			},
			{
				name: 'Get by Entity',
				value: 'getByEntity',
				description: 'Get events for specific entity',
				action: 'Get events by entity',
			},
			{
				name: 'Get by User',
				value: 'getByUser',
				description: 'Get events by user',
				action: 'Get events by user',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many audit events',
				action: 'Get many audit events',
			},
		],
		default: 'getAll',
	},
];

export const auditEventFields: INodeProperties[] = [
	// Event ID field
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'The unique identifier of the audit event',
	},
	// Date range fields
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getByDateRange'],
			},
		},
		default: '',
		description: 'Start date for the range',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getByDateRange'],
			},
		},
		default: '',
		description: 'End date for the range',
	},
	// User ID for getByUser
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getByUser'],
			},
		},
		default: 0,
		description: 'The user ID to get events for',
	},
	// Entity fields for getByEntity
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getByEntity'],
			},
		},
		options: auditEntityTypeOptions,
		default: 'CONTROL',
		description: 'Type of entity',
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getByEntity'],
			},
		},
		default: 0,
		description: 'The entity ID',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['auditEvent'],
				operation: ['getAll', 'getByDateRange', 'getByUser', 'getByEntity'],
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
				resource: ['auditEvent'],
				operation: ['getAll', 'getByDateRange', 'getByUser', 'getByEntity'],
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
				resource: ['auditEvent'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: auditActionOptions,
				default: '',
				description: 'Filter by action type',
			},
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'number',
				default: 0,
				description: 'Filter by entity ID',
			},
			{
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'options',
				options: auditEntityTypeOptions,
				default: '',
				description: 'Filter by entity type',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				default: 0,
				description: 'Filter by user who performed action',
			},
		],
	},
];

export async function executeAuditEventOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const eventId = this.getNodeParameter('eventId', i) as string;
			responseData = await drataApiRequest.call(this, 'GET', `/audit-events/${eventId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/audit-events', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/audit-events', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByDateRange': {
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			const query: IDataObject = {
				startDate: toIsoDate(startDate),
				endDate: toIsoDate(endDate),
			};

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/audit-events', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/audit-events', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByUser': {
			const userId = this.getNodeParameter('userId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/audit-events', undefined, { userId });
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', '/audit-events', undefined, { userId, limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByEntity': {
			const entityType = this.getNodeParameter('entityType', i) as string;
			const entityId = this.getNodeParameter('entityId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			const query: IDataObject = { entityType, entityId };

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/audit-events', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/audit-events', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}
	}

	return responseData;
}
