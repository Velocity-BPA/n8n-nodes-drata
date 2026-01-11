/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { DrataApi } from '../../credentials/DrataApi.credentials';

describe('DrataApi Credentials', () => {
	let credentials: DrataApi;

	beforeEach(() => {
		credentials = new DrataApi();
	});

	describe('metadata', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('drataApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Drata API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBe('https://developers.drata.com/docs/');
		});
	});

	describe('properties', () => {
		it('should have apiKey property', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp).toBeDefined();
			expect(apiKeyProp?.type).toBe('string');
			expect(apiKeyProp?.required).toBe(true);
			expect(apiKeyProp?.typeOptions?.password).toBe(true);
		});

		it('should have baseUrl property', () => {
			const baseUrlProp = credentials.properties.find((p) => p.name === 'baseUrl');
			expect(baseUrlProp).toBeDefined();
			expect(baseUrlProp?.type).toBe('string');
			expect(baseUrlProp?.default).toBe('https://public-api.drata.com');
		});
	});

	describe('authenticate', () => {
		it('should use generic authentication type', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should set Authorization header with Bearer token', () => {
			const authHeaders = credentials.authenticate.properties.headers;
			expect(authHeaders).toBeDefined();
			expect(authHeaders?.Authorization).toBe('=Bearer {{$credentials.apiKey}}');
		});
	});

	describe('test', () => {
		it('should have test request configuration', () => {
			expect(credentials.test).toBeDefined();
			expect(credentials.test.request).toBeDefined();
		});

		it('should use GET method for test', () => {
			expect(credentials.test.request.method).toBe('GET');
		});

		it('should test against users endpoint', () => {
			expect(credentials.test.request.url).toBe('/public/users');
		});

		it('should use baseUrl from credentials', () => {
			expect(credentials.test.request.baseURL).toBe('={{$credentials.baseUrl}}');
		});

		it('should request limit of 1 for test', () => {
			expect(credentials.test.request.qs?.limit).toBe(1);
		});
	});
});
