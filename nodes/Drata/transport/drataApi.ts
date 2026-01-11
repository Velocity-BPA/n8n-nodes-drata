/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an authenticated request to the Drata API
 */
export async function drataApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('drataApi');
	const baseUrl = (credentials.baseUrl as string) || 'https://public-api.drata.com';

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/public${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'drataApi',
			options,
		);
		return response as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make a paginated request to fetch all items from the Drata API
 */
export async function drataApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const limit = 50;

	const qs = query || {};
	qs.limit = limit;

	do {
		qs.page = page;

		const response = (await drataApiRequest.call(this, method, endpoint, body, qs)) as IDataObject;

		if (response.data && Array.isArray(response.data)) {
			returnData.push(...(response.data as IDataObject[]));

			if ((response.data as IDataObject[]).length < limit) {
				break;
			}
			page++;
		} else {
			break;
		}
	} while (page > 0);

	return returnData;
}

/**
 * Upload a file to the Drata API
 */
export async function drataUploadFile(
	this: IExecuteFunctions,
	endpoint: string,
	binaryPropertyName: string,
	itemIndex: number,
	additionalFields?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('drataApi');
	const baseUrl = (credentials.baseUrl as string) || 'https://public-api.drata.com';

	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const formData: IDataObject = {
		file: {
			value: binaryDataBuffer,
			options: {
				filename: binaryData.fileName || 'file',
				contentType: binaryData.mimeType,
			},
		},
	};

	if (additionalFields) {
		for (const [key, value] of Object.entries(additionalFields)) {
			formData[key] = value;
		}
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/public${endpoint}`,
		headers: {
			Accept: 'application/json',
		},
		body: formData,
		json: true,
	};

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'drataApi',
			options,
		);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Handle rate limiting with exponential backoff
 */
export async function drataApiRequestWithRetry(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
	maxRetries = 3,
): Promise<IDataObject | IDataObject[]> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await drataApiRequest.call(this, method, endpoint, body, query);
		} catch (error) {
			lastError = error as Error;

			// Check if it's a rate limit error (429)
			if ((error as JsonObject).httpCode === 429 && attempt < maxRetries) {
				// Exponential backoff: 1s, 2s, 4s, 8s
				const waitTime = Math.pow(2, attempt) * 1000;
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			throw error;
		}
	}

	throw lastError;
}
