/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

/**
 * Remove undefined and null values from an object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const result: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Convert a date string to ISO format
 */
export function toIsoDate(dateString: string): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toISOString();
}

/**
 * Parse a date string or timestamp
 */
export function parseDate(value: string | number): Date {
	if (typeof value === 'number') {
		return new Date(value);
	}
	return new Date(value);
}

/**
 * Format date for Drata API
 */
export function formatDateForApi(date: Date | string): string {
	if (typeof date === 'string') {
		date = new Date(date);
	}
	return date.toISOString().split('T')[0];
}

/**
 * Status options for controls
 */
export const controlStatusOptions: INodePropertyOptions[] = [
	{ name: 'Passing', value: 'PASSING' },
	{ name: 'Failing', value: 'FAILING' },
	{ name: 'Not Applicable', value: 'NOT_APPLICABLE' },
	{ name: 'Disabled', value: 'DISABLED' },
];

/**
 * Monitoring type options
 */
export const monitoringTypeOptions: INodePropertyOptions[] = [
	{ name: 'Automated', value: 'AUTOMATED' },
	{ name: 'Manual', value: 'MANUAL' },
	{ name: 'Hybrid', value: 'HYBRID' },
];

/**
 * Employment type options
 */
export const employmentTypeOptions: INodePropertyOptions[] = [
	{ name: 'Employee', value: 'EMPLOYEE' },
	{ name: 'Contractor', value: 'CONTRACTOR' },
	{ name: 'Vendor', value: 'VENDOR' },
];

/**
 * Asset type options
 */
export const assetTypeOptions: INodePropertyOptions[] = [
	{ name: 'Device', value: 'DEVICE' },
	{ name: 'Application', value: 'APPLICATION' },
	{ name: 'Infrastructure', value: 'INFRASTRUCTURE' },
	{ name: 'Data', value: 'DATA' },
];

/**
 * Asset status options
 */
export const assetStatusOptions: INodePropertyOptions[] = [
	{ name: 'Active', value: 'ACTIVE' },
	{ name: 'Inactive', value: 'INACTIVE' },
	{ name: 'Retired', value: 'RETIRED' },
];

/**
 * Vendor risk rating options
 */
export const vendorRiskRatingOptions: INodePropertyOptions[] = [
	{ name: 'Low', value: 'LOW' },
	{ name: 'Medium', value: 'MEDIUM' },
	{ name: 'High', value: 'HIGH' },
	{ name: 'Critical', value: 'CRITICAL' },
];

/**
 * Vendor status options
 */
export const vendorStatusOptions: INodePropertyOptions[] = [
	{ name: 'Active', value: 'ACTIVE' },
	{ name: 'Under Review', value: 'UNDER_REVIEW' },
	{ name: 'Inactive', value: 'INACTIVE' },
	{ name: 'Terminated', value: 'TERMINATED' },
];

/**
 * Evidence type options
 */
export const evidenceTypeOptions: INodePropertyOptions[] = [
	{ name: 'Security Training', value: 'SEC_TRAINING' },
	{ name: 'Background Check', value: 'BACKGROUND_CHECK' },
	{ name: 'Policy Acknowledgment', value: 'POLICY_ACKNOWLEDGMENT' },
	{ name: 'MDM Compliance', value: 'MDM_COMPLIANCE' },
	{ name: 'Custom', value: 'CUSTOM' },
];

/**
 * Framework type options
 */
export const frameworkTypeOptions: INodePropertyOptions[] = [
	{ name: 'SOC 2 Type 1', value: 'SOC2_TYPE1' },
	{ name: 'SOC 2 Type 2', value: 'SOC2_TYPE2' },
	{ name: 'ISO 27001', value: 'ISO27001' },
	{ name: 'HIPAA', value: 'HIPAA' },
	{ name: 'GDPR', value: 'GDPR' },
	{ name: 'PCI DSS', value: 'PCI_DSS' },
	{ name: 'SOX', value: 'SOX' },
];

/**
 * Framework status options
 */
export const frameworkStatusOptions: INodePropertyOptions[] = [
	{ name: 'In Progress', value: 'IN_PROGRESS' },
	{ name: 'Ready for Audit', value: 'READY_FOR_AUDIT' },
	{ name: 'Certified', value: 'CERTIFIED' },
];

/**
 * Risk category options
 */
export const riskCategoryOptions: INodePropertyOptions[] = [
	{ name: 'Operational', value: 'OPERATIONAL' },
	{ name: 'Financial', value: 'FINANCIAL' },
	{ name: 'Compliance', value: 'COMPLIANCE' },
	{ name: 'Security', value: 'SECURITY' },
	{ name: 'Strategic', value: 'STRATEGIC' },
];

/**
 * Risk likelihood options
 */
export const riskLikelihoodOptions: INodePropertyOptions[] = [
	{ name: 'Rare', value: 'RARE' },
	{ name: 'Unlikely', value: 'UNLIKELY' },
	{ name: 'Possible', value: 'POSSIBLE' },
	{ name: 'Likely', value: 'LIKELY' },
	{ name: 'Almost Certain', value: 'ALMOST_CERTAIN' },
];

/**
 * Risk impact options
 */
export const riskImpactOptions: INodePropertyOptions[] = [
	{ name: 'Negligible', value: 'NEGLIGIBLE' },
	{ name: 'Minor', value: 'MINOR' },
	{ name: 'Moderate', value: 'MODERATE' },
	{ name: 'Major', value: 'MAJOR' },
	{ name: 'Severe', value: 'SEVERE' },
];

/**
 * Risk status options
 */
export const riskStatusOptions: INodePropertyOptions[] = [
	{ name: 'Identified', value: 'IDENTIFIED' },
	{ name: 'Analyzing', value: 'ANALYZING' },
	{ name: 'Treating', value: 'TREATING' },
	{ name: 'Monitoring', value: 'MONITORING' },
	{ name: 'Closed', value: 'CLOSED' },
];

/**
 * Policy status options
 */
export const policyStatusOptions: INodePropertyOptions[] = [
	{ name: 'Draft', value: 'DRAFT' },
	{ name: 'Published', value: 'PUBLISHED' },
	{ name: 'Archived', value: 'ARCHIVED' },
];

/**
 * User role options
 */
export const userRoleOptions: INodePropertyOptions[] = [
	{ name: 'Owner', value: 'OWNER' },
	{ name: 'Admin', value: 'ADMIN' },
	{ name: 'Member', value: 'MEMBER' },
	{ name: 'Auditor', value: 'AUDITOR' },
	{ name: 'Viewer', value: 'VIEWER' },
];

/**
 * User status options
 */
export const userStatusOptions: INodePropertyOptions[] = [
	{ name: 'Active', value: 'ACTIVE' },
	{ name: 'Invited', value: 'INVITED' },
	{ name: 'Deactivated', value: 'DEACTIVATED' },
];

/**
 * Background check status options
 */
export const backgroundCheckStatusOptions: INodePropertyOptions[] = [
	{ name: 'Pending', value: 'PENDING' },
	{ name: 'In Progress', value: 'IN_PROGRESS' },
	{ name: 'Completed', value: 'COMPLETED' },
	{ name: 'Failed', value: 'FAILED' },
	{ name: 'Expired', value: 'EXPIRED' },
];

/**
 * Training status options
 */
export const trainingStatusOptions: INodePropertyOptions[] = [
	{ name: 'Not Started', value: 'NOT_STARTED' },
	{ name: 'In Progress', value: 'IN_PROGRESS' },
	{ name: 'Completed', value: 'COMPLETED' },
	{ name: 'Expired', value: 'EXPIRED' },
];

/**
 * Audit entity type options
 */
export const auditEntityTypeOptions: INodePropertyOptions[] = [
	{ name: 'Control', value: 'CONTROL' },
	{ name: 'Personnel', value: 'PERSONNEL' },
	{ name: 'Vendor', value: 'VENDOR' },
	{ name: 'Evidence', value: 'EVIDENCE' },
	{ name: 'Policy', value: 'POLICY' },
	{ name: 'Risk', value: 'RISK' },
];

/**
 * Audit action options
 */
export const auditActionOptions: INodePropertyOptions[] = [
	{ name: 'Create', value: 'CREATE' },
	{ name: 'Update', value: 'UPDATE' },
	{ name: 'Delete', value: 'DELETE' },
	{ name: 'View', value: 'VIEW' },
	{ name: 'Upload', value: 'UPLOAD' },
];
