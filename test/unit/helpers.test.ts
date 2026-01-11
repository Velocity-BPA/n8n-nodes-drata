/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	cleanObject,
	toIsoDate,
	parseDate,
	formatDateForApi,
	controlStatusOptions,
	monitoringTypeOptions,
	employmentTypeOptions,
	assetTypeOptions,
	vendorRiskRatingOptions,
	evidenceTypeOptions,
	frameworkTypeOptions,
	riskCategoryOptions,
	riskLikelihoodOptions,
	riskImpactOptions,
	riskStatusOptions,
	policyStatusOptions,
	userRoleOptions,
	backgroundCheckStatusOptions,
	trainingStatusOptions,
	auditEntityTypeOptions,
	auditActionOptions,
} from '../../nodes/Drata/utils/helpers';

describe('Helper Functions', () => {
	describe('cleanObject', () => {
		it('should remove undefined values', () => {
			const input = { a: 1, b: undefined, c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove null values', () => {
			const input = { a: 1, b: null, c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove empty string values', () => {
			const input = { a: 1, b: '', c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should keep zero values', () => {
			const input = { a: 0, b: 1 };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 0, b: 1 });
		});

		it('should keep false values', () => {
			const input = { a: false, b: true };
			const result = cleanObject(input);
			expect(result).toEqual({ a: false, b: true });
		});

		it('should return empty object for all empty values', () => {
			const input = { a: undefined, b: null, c: '' };
			const result = cleanObject(input);
			expect(result).toEqual({});
		});
	});

	describe('toIsoDate', () => {
		it('should convert date string to ISO format', () => {
			const result = toIsoDate('2024-01-15');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		});

		it('should return empty string for empty input', () => {
			const result = toIsoDate('');
			expect(result).toBe('');
		});

		it('should handle ISO date string', () => {
			const isoDate = '2024-01-15T12:00:00.000Z';
			const result = toIsoDate(isoDate);
			expect(result).toBe(isoDate);
		});
	});

	describe('parseDate', () => {
		it('should parse string date', () => {
			const result = parseDate('2024-01-15');
			expect(result).toBeInstanceOf(Date);
			expect(result.getFullYear()).toBe(2024);
		});

		it('should parse timestamp number', () => {
			const timestamp = 1705312800000; // 2024-01-15
			const result = parseDate(timestamp);
			expect(result).toBeInstanceOf(Date);
		});

		it('should parse ISO string', () => {
			const result = parseDate('2024-01-15T12:00:00.000Z');
			expect(result).toBeInstanceOf(Date);
		});
	});

	describe('formatDateForApi', () => {
		it('should format Date object to YYYY-MM-DD', () => {
			const date = new Date('2024-01-15T12:00:00.000Z');
			const result = formatDateForApi(date);
			expect(result).toBe('2024-01-15');
		});

		it('should format string date to YYYY-MM-DD', () => {
			const result = formatDateForApi('2024-01-15T12:00:00.000Z');
			expect(result).toBe('2024-01-15');
		});
	});
});

describe('Option Arrays', () => {
	describe('controlStatusOptions', () => {
		it('should have all control status options', () => {
			expect(controlStatusOptions).toHaveLength(4);
			const values = controlStatusOptions.map((o) => o.value);
			expect(values).toContain('PASSING');
			expect(values).toContain('FAILING');
			expect(values).toContain('NOT_APPLICABLE');
			expect(values).toContain('DISABLED');
		});
	});

	describe('monitoringTypeOptions', () => {
		it('should have all monitoring type options', () => {
			expect(monitoringTypeOptions).toHaveLength(3);
			const values = monitoringTypeOptions.map((o) => o.value);
			expect(values).toContain('AUTOMATED');
			expect(values).toContain('MANUAL');
			expect(values).toContain('HYBRID');
		});
	});

	describe('employmentTypeOptions', () => {
		it('should have all employment type options', () => {
			expect(employmentTypeOptions).toHaveLength(3);
			const values = employmentTypeOptions.map((o) => o.value);
			expect(values).toContain('EMPLOYEE');
			expect(values).toContain('CONTRACTOR');
			expect(values).toContain('VENDOR');
		});
	});

	describe('assetTypeOptions', () => {
		it('should have all asset type options', () => {
			expect(assetTypeOptions).toHaveLength(4);
			const values = assetTypeOptions.map((o) => o.value);
			expect(values).toContain('DEVICE');
			expect(values).toContain('APPLICATION');
			expect(values).toContain('INFRASTRUCTURE');
			expect(values).toContain('DATA');
		});
	});

	describe('vendorRiskRatingOptions', () => {
		it('should have all vendor risk rating options', () => {
			expect(vendorRiskRatingOptions).toHaveLength(4);
			const values = vendorRiskRatingOptions.map((o) => o.value);
			expect(values).toContain('LOW');
			expect(values).toContain('MEDIUM');
			expect(values).toContain('HIGH');
			expect(values).toContain('CRITICAL');
		});
	});

	describe('evidenceTypeOptions', () => {
		it('should have all evidence type options', () => {
			expect(evidenceTypeOptions).toHaveLength(5);
			const values = evidenceTypeOptions.map((o) => o.value);
			expect(values).toContain('SEC_TRAINING');
			expect(values).toContain('BACKGROUND_CHECK');
			expect(values).toContain('POLICY_ACKNOWLEDGMENT');
			expect(values).toContain('MDM_COMPLIANCE');
			expect(values).toContain('CUSTOM');
		});
	});

	describe('frameworkTypeOptions', () => {
		it('should have all framework type options', () => {
			expect(frameworkTypeOptions).toHaveLength(7);
			const values = frameworkTypeOptions.map((o) => o.value);
			expect(values).toContain('SOC2_TYPE1');
			expect(values).toContain('SOC2_TYPE2');
			expect(values).toContain('ISO27001');
			expect(values).toContain('HIPAA');
			expect(values).toContain('GDPR');
			expect(values).toContain('PCI_DSS');
			expect(values).toContain('SOX');
		});
	});

	describe('riskCategoryOptions', () => {
		it('should have all risk category options', () => {
			expect(riskCategoryOptions).toHaveLength(5);
			const values = riskCategoryOptions.map((o) => o.value);
			expect(values).toContain('OPERATIONAL');
			expect(values).toContain('FINANCIAL');
			expect(values).toContain('COMPLIANCE');
			expect(values).toContain('SECURITY');
			expect(values).toContain('STRATEGIC');
		});
	});

	describe('riskLikelihoodOptions', () => {
		it('should have all risk likelihood options', () => {
			expect(riskLikelihoodOptions).toHaveLength(5);
			const values = riskLikelihoodOptions.map((o) => o.value);
			expect(values).toContain('RARE');
			expect(values).toContain('UNLIKELY');
			expect(values).toContain('POSSIBLE');
			expect(values).toContain('LIKELY');
			expect(values).toContain('ALMOST_CERTAIN');
		});
	});

	describe('riskImpactOptions', () => {
		it('should have all risk impact options', () => {
			expect(riskImpactOptions).toHaveLength(5);
			const values = riskImpactOptions.map((o) => o.value);
			expect(values).toContain('NEGLIGIBLE');
			expect(values).toContain('MINOR');
			expect(values).toContain('MODERATE');
			expect(values).toContain('MAJOR');
			expect(values).toContain('SEVERE');
		});
	});

	describe('riskStatusOptions', () => {
		it('should have all risk status options', () => {
			expect(riskStatusOptions).toHaveLength(5);
			const values = riskStatusOptions.map((o) => o.value);
			expect(values).toContain('IDENTIFIED');
			expect(values).toContain('ANALYZING');
			expect(values).toContain('TREATING');
			expect(values).toContain('MONITORING');
			expect(values).toContain('CLOSED');
		});
	});

	describe('policyStatusOptions', () => {
		it('should have all policy status options', () => {
			expect(policyStatusOptions).toHaveLength(3);
			const values = policyStatusOptions.map((o) => o.value);
			expect(values).toContain('DRAFT');
			expect(values).toContain('PUBLISHED');
			expect(values).toContain('ARCHIVED');
		});
	});

	describe('userRoleOptions', () => {
		it('should have all user role options', () => {
			expect(userRoleOptions).toHaveLength(5);
			const values = userRoleOptions.map((o) => o.value);
			expect(values).toContain('OWNER');
			expect(values).toContain('ADMIN');
			expect(values).toContain('MEMBER');
			expect(values).toContain('AUDITOR');
			expect(values).toContain('VIEWER');
		});
	});

	describe('backgroundCheckStatusOptions', () => {
		it('should have all background check status options', () => {
			expect(backgroundCheckStatusOptions).toHaveLength(5);
			const values = backgroundCheckStatusOptions.map((o) => o.value);
			expect(values).toContain('PENDING');
			expect(values).toContain('IN_PROGRESS');
			expect(values).toContain('COMPLETED');
			expect(values).toContain('FAILED');
			expect(values).toContain('EXPIRED');
		});
	});

	describe('trainingStatusOptions', () => {
		it('should have all training status options', () => {
			expect(trainingStatusOptions).toHaveLength(4);
			const values = trainingStatusOptions.map((o) => o.value);
			expect(values).toContain('NOT_STARTED');
			expect(values).toContain('IN_PROGRESS');
			expect(values).toContain('COMPLETED');
			expect(values).toContain('EXPIRED');
		});
	});

	describe('auditEntityTypeOptions', () => {
		it('should have all audit entity type options', () => {
			expect(auditEntityTypeOptions).toHaveLength(6);
			const values = auditEntityTypeOptions.map((o) => o.value);
			expect(values).toContain('CONTROL');
			expect(values).toContain('PERSONNEL');
			expect(values).toContain('VENDOR');
			expect(values).toContain('EVIDENCE');
			expect(values).toContain('POLICY');
			expect(values).toContain('RISK');
		});
	});

	describe('auditActionOptions', () => {
		it('should have all audit action options', () => {
			expect(auditActionOptions).toHaveLength(5);
			const values = auditActionOptions.map((o) => o.value);
			expect(values).toContain('CREATE');
			expect(values).toContain('UPDATE');
			expect(values).toContain('DELETE');
			expect(values).toContain('VIEW');
			expect(values).toContain('UPLOAD');
		});
	});
});
