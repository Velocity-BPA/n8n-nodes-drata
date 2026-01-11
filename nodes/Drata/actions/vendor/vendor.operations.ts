/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { drataApiRequest, drataApiRequestAllItems, drataUploadFile } from '../../transport';
import { cleanObject, vendorRiskRatingOptions, vendorStatusOptions, formatDateForApi } from '../../utils';

export const vendorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vendor'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new vendor',
				action: 'Create a vendor',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a vendor',
				action: 'Delete a vendor',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a vendor by ID',
				action: 'Get a vendor',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many vendors',
				action: 'Get many vendors',
			},
			{
				name: 'Get Security Assessment',
				value: 'getSecurityAssessment',
				description: 'Get vendor security assessment',
				action: 'Get security assessment',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a vendor',
				action: 'Update a vendor',
			},
			{
				name: 'Upload Document',
				value: 'uploadDocument',
				description: 'Upload vendor documentation',
				action: 'Upload vendor document',
			},
		],
		default: 'getAll',
	},
];

export const vendorFields: INodeProperties[] = [
	// Vendor ID field
	{
		displayName: 'Vendor ID',
		name: 'vendorId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['vendor'],
				operation: ['get', 'update', 'delete', 'getSecurityAssessment', 'uploadDocument'],
			},
		},
		default: 0,
		description: 'The unique identifier of the vendor',
	},
	// Create fields
	{
		displayName: 'Vendor Name',
		name: 'vendorName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vendor'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the vendor',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['vendor'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Vendor category',
			},
			{
				displayName: 'Contract Expiration',
				name: 'contractExpiration',
				type: 'dateTime',
				default: '',
				description: 'Contract end date',
			},
			{
				displayName: 'Risk Rating',
				name: 'riskRating',
				type: 'options',
				options: vendorRiskRatingOptions,
				default: 'LOW',
				description: 'Vendor risk rating',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: vendorStatusOptions,
				default: 'ACTIVE',
				description: 'Vendor status',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Vendor website URL',
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
				resource: ['vendor'],
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
				resource: ['vendor'],
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
				resource: ['vendor'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Filter by category',
			},
			{
				displayName: 'Risk Rating',
				name: 'riskRating',
				type: 'options',
				options: vendorRiskRatingOptions,
				default: '',
				description: 'Filter by risk rating',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: vendorStatusOptions,
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
				resource: ['vendor'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Vendor category',
			},
			{
				displayName: 'Contract Expiration',
				name: 'contractExpiration',
				type: 'dateTime',
				default: '',
				description: 'Contract end date',
			},
			{
				displayName: 'Risk Rating',
				name: 'riskRating',
				type: 'options',
				options: vendorRiskRatingOptions,
				default: '',
				description: 'Vendor risk rating',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: vendorStatusOptions,
				default: '',
				description: 'Vendor status',
			},
			{
				displayName: 'Vendor Name',
				name: 'vendorName',
				type: 'string',
				default: '',
				description: 'Name of the vendor',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Vendor website URL',
			},
		],
	},
	// Upload Document fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['vendor'],
				operation: ['uploadDocument'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Document Options',
		name: 'documentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['vendor'],
				operation: ['uploadDocument'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the document',
			},
			{
				displayName: 'Document Type',
				name: 'documentType',
				type: 'options',
				options: [
					{ name: 'Contract', value: 'CONTRACT' },
					{ name: 'Insurance', value: 'INSURANCE' },
					{ name: 'Security Assessment', value: 'SECURITY_ASSESSMENT' },
					{ name: 'SOC Report', value: 'SOC_REPORT' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'OTHER',
				description: 'Type of document',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationDate',
				type: 'dateTime',
				default: '',
				description: 'When the document expires',
			},
		],
	},
];

export async function executeVendorOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'create': {
			const vendorName = this.getNodeParameter('vendorName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				vendorName,
				...cleanObject(additionalFields),
			};

			if (body.contractExpiration) {
				body.contractExpiration = formatDateForApi(body.contractExpiration as string);
			}

			responseData = await drataApiRequest.call(this, 'POST', '/vendors', body);
			break;
		}

		case 'get': {
			const vendorId = this.getNodeParameter('vendorId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/vendors/${vendorId}`);
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query = cleanObject(filters);

			if (returnAll) {
				responseData = await drataApiRequestAllItems.call(this, 'GET', '/vendors', undefined, query);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				query.limit = limit;
				const response = (await drataApiRequest.call(this, 'GET', '/vendors', undefined, query)) as IDataObject;
				responseData = (response.data as IDataObject[]) || [];
			}
			break;
		}

		case 'update': {
			const vendorId = this.getNodeParameter('vendorId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = cleanObject(updateFields);

			if (body.contractExpiration) {
				body.contractExpiration = formatDateForApi(body.contractExpiration as string);
			}

			responseData = await drataApiRequest.call(this, 'PUT', `/vendors/${vendorId}`, body);
			break;
		}

		case 'delete': {
			const vendorId = this.getNodeParameter('vendorId', i) as number;
			responseData = await drataApiRequest.call(this, 'DELETE', `/vendors/${vendorId}`);
			break;
		}

		case 'getSecurityAssessment': {
			const vendorId = this.getNodeParameter('vendorId', i) as number;
			responseData = await drataApiRequest.call(this, 'GET', `/vendors/${vendorId}/security-assessment`);
			break;
		}

		case 'uploadDocument': {
			const vendorId = this.getNodeParameter('vendorId', i) as number;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const documentOptions = this.getNodeParameter('documentOptions', i) as IDataObject;
			responseData = await drataUploadFile.call(
				this,
				`/vendors/${vendorId}/documents`,
				binaryPropertyName,
				i,
				cleanObject(documentOptions),
			);
			break;
		}
	}

	return responseData;
}
