/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Drata } from '../../nodes/Drata/Drata.node';
import { DrataTrigger } from '../../nodes/Drata/DrataTrigger.node';

describe('Drata Node', () => {
	let drataNode: Drata;

	beforeEach(() => {
		drataNode = new Drata();
	});

	describe('node description', () => {
		it('should have correct display name', () => {
			expect(drataNode.description.displayName).toBe('Drata');
		});

		it('should have correct name', () => {
			expect(drataNode.description.name).toBe('drata');
		});

		it('should have correct group', () => {
			expect(drataNode.description.group).toContain('transform');
		});

		it('should have version 1', () => {
			expect(drataNode.description.version).toBe(1);
		});

		it('should require drataApi credentials', () => {
			const credentials = drataNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.length).toBeGreaterThan(0);
			expect(credentials?.[0].name).toBe('drataApi');
			expect(credentials?.[0].required).toBe(true);
		});

		it('should have icon file reference', () => {
			expect(drataNode.description.icon).toBe('file:drata.svg');
		});
	});

	describe('resources', () => {
		const resourceProperty = new Drata().description.properties.find(
			(p) => p.name === 'resource',
		);

		it('should have resource property', () => {
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
		});

		it('should have all 12 resources', () => {
			const options = resourceProperty?.options as Array<{ value: string }>;
			expect(options?.length).toBe(12);

			const resourceValues = options?.map((o) => o.value);
			expect(resourceValues).toContain('control');
			expect(resourceValues).toContain('personnel');
			expect(resourceValues).toContain('asset');
			expect(resourceValues).toContain('vendor');
			expect(resourceValues).toContain('evidence');
			expect(resourceValues).toContain('framework');
			expect(resourceValues).toContain('risk');
			expect(resourceValues).toContain('policy');
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('backgroundCheck');
			expect(resourceValues).toContain('securityTraining');
			expect(resourceValues).toContain('auditEvent');
		});

		it('should have control as default resource', () => {
			expect(resourceProperty?.default).toBe('control');
		});
	});

	describe('operations', () => {
		const properties = new Drata().description.properties;

		it('should have operation properties for each resource', () => {
			const operationProps = properties.filter((p) => p.name === 'operation');
			// Each resource should have its own operation property
			expect(operationProps.length).toBeGreaterThanOrEqual(12);
		});

		it('should have control operations', () => {
			const controlOps = properties.find(
				(p) =>
					p.name === 'operation' &&
					p.displayOptions?.show?.resource?.includes('control'),
			);
			expect(controlOps).toBeDefined();
			const options = controlOps?.options as Array<{ value: string }>;
			const values = options?.map((o) => o.value);
			expect(values).toContain('get');
			expect(values).toContain('getAll');
			expect(values).toContain('update');
			expect(values).toContain('getEvidence');
			expect(values).toContain('uploadEvidence');
			expect(values).toContain('getMonitoringStatus');
		});

		it('should have personnel operations', () => {
			const personnelOps = properties.find(
				(p) =>
					p.name === 'operation' &&
					p.displayOptions?.show?.resource?.includes('personnel'),
			);
			expect(personnelOps).toBeDefined();
			const options = personnelOps?.options as Array<{ value: string }>;
			const values = options?.map((o) => o.value);
			expect(values).toContain('create');
			expect(values).toContain('get');
			expect(values).toContain('getAll');
			expect(values).toContain('update');
			expect(values).toContain('offboard');
		});

		it('should have vendor operations', () => {
			const vendorOps = properties.find(
				(p) =>
					p.name === 'operation' &&
					p.displayOptions?.show?.resource?.includes('vendor'),
			);
			expect(vendorOps).toBeDefined();
			const options = vendorOps?.options as Array<{ value: string }>;
			const values = options?.map((o) => o.value);
			expect(values).toContain('create');
			expect(values).toContain('get');
			expect(values).toContain('getAll');
			expect(values).toContain('update');
			expect(values).toContain('delete');
		});
	});

	describe('execute method', () => {
		it('should have execute method', () => {
			expect(typeof drataNode.execute).toBe('function');
		});
	});
});

describe('DrataTrigger Node', () => {
	let triggerNode: DrataTrigger;

	beforeEach(() => {
		triggerNode = new DrataTrigger();
	});

	describe('node description', () => {
		it('should have correct display name', () => {
			expect(triggerNode.description.displayName).toBe('Drata Trigger');
		});

		it('should have correct name', () => {
			expect(triggerNode.description.name).toBe('drataTrigger');
		});

		it('should be in trigger group', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have polling enabled', () => {
			expect(triggerNode.description.polling).toBe(true);
		});

		it('should require drataApi credentials', () => {
			const credentials = triggerNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.[0].name).toBe('drataApi');
			expect(credentials?.[0].required).toBe(true);
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});
	});

	describe('events', () => {
		const eventProperty = new DrataTrigger().description.properties.find(
			(p) => p.name === 'event',
		);

		it('should have event property', () => {
			expect(eventProperty).toBeDefined();
			expect(eventProperty?.type).toBe('options');
			expect(eventProperty?.required).toBe(true);
		});

		it('should have all 8 event types', () => {
			const options = eventProperty?.options as Array<{ value: string }>;
			expect(options?.length).toBe(8);

			const eventValues = options?.map((o) => o.value);
			expect(eventValues).toContain('controlStatusChanged');
			expect(eventValues).toContain('personnelComplianceChanged');
			expect(eventValues).toContain('evidenceExpiring');
			expect(eventValues).toContain('vendorRiskChanged');
			expect(eventValues).toContain('trainingOverdue');
			expect(eventValues).toContain('backgroundCheckExpiring');
			expect(eventValues).toContain('policyAcknowledgmentPending');
			expect(eventValues).toContain('auditEventCreated');
		});

		it('should have controlStatusChanged as default event', () => {
			expect(eventProperty?.default).toBe('controlStatusChanged');
		});
	});

	describe('options', () => {
		const optionsProperty = new DrataTrigger().description.properties.find(
			(p) => p.name === 'options',
		);

		it('should have options collection', () => {
			expect(optionsProperty).toBeDefined();
			expect(optionsProperty?.type).toBe('collection');
		});

		it('should have daysBeforeExpiry option', () => {
			const options = optionsProperty?.options as Array<{ name: string }>;
			const daysOption = options?.find((o) => o.name === 'daysBeforeExpiry');
			expect(daysOption).toBeDefined();
		});

		it('should have includeDetails option', () => {
			const options = optionsProperty?.options as Array<{ name: string }>;
			const detailsOption = options?.find((o) => o.name === 'includeDetails');
			expect(detailsOption).toBeDefined();
		});
	});

	describe('poll method', () => {
		it('should have poll method', () => {
			expect(typeof triggerNode.poll).toBe('function');
		});
	});
});
