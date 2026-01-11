/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, evidenceTypeOptions, formatDateForApi } from '../../utils';

export const evidenceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['evidence'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete evidence',
				action: 'Delete evidence',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get evidence by ID',
				action: 'Get evidence',
			},
			{
				name: 'Get by Control',
				value: 'getByControl',
				description: 'Get evidence for a specific control',
				action: 'Get evidence by control',
			},
			{
				name: 'Get by Type',
				value: 'getByType',
				description: 'Get evidence by type',
				action: 'Get evidence by type',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many evidence items',
				action: 'Get many evidence',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload new evidence',
				action: 'Upload evidence',
			},
		],
		default: 'getAll',
	},
];

export const evidenceFields: INodeProperties[] = [
	// Evidence ID field
	{
		displayName: 'Evidence ID',
		name: 'evidenceId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['get', 'delete'],
			},
		},
		default: 0,
		description: 'The unique identifier of the evidence',
	},
	// Control ID for getByControl
	{
		displayName: 'Control ID',
		name: 'controlId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['getByControl'],
			},
		},
		default: 0,
		description: 'The control ID to get evidence for',
	},
	// Type for getByType
	{
		displayName: 'Evidence Type',
		name: 'evidenceType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['getByType'],
			},
		},
		options: evidenceTypeOptions,
		default: 'CUSTOM',
		description: 'Type of evidence to retrieve',
	},
	// Get All filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['getAll', 'getByControl', 'getByType'],
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
				resource: ['evidence'],
				operation: ['getAll', 'getByControl', 'getByType'],
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
				resource: ['evidence'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Control ID',
				name: 'controlId',
				type: 'number',
				default: 0,
				description: 'Filter by control ID',
			},
			{
				displayName: 'Evidence Type',
				name: 'type',
				type: 'options',
				options: evidenceTypeOptions,
				default: '',
				description: 'Filter by evidence type',
			},
			{
				displayName: 'Uploaded By',
				name: 'uploadedBy',
				type: 'number',
				default: 0,
				description: 'Filter by user who uploaded',
			},
		],
	},
	// Upload fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['upload'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Control ID',
		name: 'controlId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['upload'],
			},
		},
		default: 0,
		description: 'The control to attach this evidence to',
	},
	{
		displayName: 'Evidence Options',
		name: 'evidenceOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['evidence'],
				operation: ['upload'],
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
				options: evidenceTypeOptions,
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

export async function executeEvidenceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'get': {
			const evidenceId = this.getNodeParameter('evidenceId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/evidence/${evidenceId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/evidence', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/evidence', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByControl': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', `/controls/${controlId}/evidence`);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', `/controls/${controlId}/evidence`, undefined, { limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'getByType': {
			const evidenceType = this.getNodeParameter('evidenceType', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/evidence', undefined, { type: evidenceType });
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				const response = (await drataApiRequest.call(this, 'GET', '/evidence', undefined, { type: evidenceType, limit })) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'upload': {
			const controlId = this.getNodeParameter('controlId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const evidenceOptions = this.getNodeParameter('evidenceOptions', i) as IDataObject;

			const options = cleanObject(evidenceOptions);
			if (options.expirationDate) {
				options.expirationDate = formatDateForApi(options.expirationDate as string);
			}

			responseData = await drataUploadFile.call(
				this,
				`/controls/${controlId}/evidence`,
				binaryPropertyName,
				i,
				options,
			);
			break;
		}

		case 'delete': {
			const evidenceId = this.getNodeParameter('evidenceId', i) as number;
			responseData = await drataApiRequest.call(this, 'DELETE', `/evidence/${evidenceId}`);
			break;
		}
	}

	return responseData;
}
