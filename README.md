# n8n-nodes-drata

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Drata compliance automation platform. This node enables workflow automation for compliance monitoring, evidence collection, personnel management, control tracking, and risk management through Drata's REST API.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **12 Resource Categories**: Complete coverage of Drata's compliance platform
- **60+ Operations**: Full CRUD operations for all resources
- **8 Trigger Events**: Polling-based triggers for compliance monitoring
- **File Upload Support**: Upload evidence and documents directly
- **Pagination Support**: Automatic handling of large result sets
- **Rate Limit Handling**: Built-in exponential backoff for API rate limits

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-drata` and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-drata
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-drata.git
cd n8n-nodes-drata

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n (Linux/macOS)
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-drata

# Restart n8n
n8n start
```

## Credentials Setup

### Drata API Key

| Field | Description |
|-------|-------------|
| API Key | Your Drata API key (from Settings > API) |
| Base URL | API endpoint (default: https://public-api.drata.com) |

### Getting Your API Key

1. Log into the Drata Admin Console
2. Navigate to **Settings** > **API**
3. Click **Create API Key**
4. Configure name, expiration, and scope permissions
5. Copy the generated API key (only shown once)

## Resources & Operations

### Control
| Operation | Description |
|-----------|-------------|
| Get | Get a control by ID |
| Get Many | List all controls with filtering |
| Update | Update control details |
| Get Evidence | Get evidence linked to a control |
| Upload Evidence | Upload external evidence to a control |
| Get Monitoring Status | Get control monitoring status |

### Personnel
| Operation | Description |
|-----------|-------------|
| Create | Create new personnel record |
| Get | Get person by ID |
| Get by Email | Search personnel by email |
| Get Many | List all personnel |
| Update | Update personnel details |
| Offboard | Mark person as offboarded |
| Upload Evidence | Upload compliance evidence |
| Get Compliance Status | Get person's compliance status |

### Asset
| Operation | Description |
|-----------|-------------|
| Create | Create new asset |
| Get | Get asset by ID |
| Get Many | List all assets |
| Update | Update asset details |
| Delete | Delete an asset |
| Get Compliance Status | Get asset compliance status |

### Vendor
| Operation | Description |
|-----------|-------------|
| Create | Create new vendor |
| Get | Get vendor by ID |
| Get Many | List all vendors |
| Update | Update vendor details |
| Delete | Delete a vendor |
| Get Security Assessment | Get vendor security assessment |
| Upload Document | Upload vendor documentation |

### Evidence
| Operation | Description |
|-----------|-------------|
| Get | Get evidence by ID |
| Get Many | List all evidence items |
| Get by Control | Get evidence for a specific control |
| Get by Type | Get evidence by type |
| Upload | Upload new evidence |
| Delete | Delete evidence |

### Framework
| Operation | Description |
|-----------|-------------|
| Get | Get framework by ID |
| Get Many | List all enabled frameworks |
| Get Controls | Get controls for a framework |
| Get Compliance Score | Get compliance score for framework |
| Get Gaps | Get compliance gaps for framework |

### Risk
| Operation | Description |
|-----------|-------------|
| Create | Create new risk |
| Get | Get risk by ID |
| Get Many | List all risks |
| Update | Update risk details |
| Delete | Delete a risk |
| Add Mitigation | Add mitigation plan |
| Link Control | Link risk to control |

### Policy
| Operation | Description |
|-----------|-------------|
| Get | Get policy by ID |
| Get Many | List all policies |
| Get Acknowledgments | Get policy acknowledgment status |
| Get Version History | Get policy version history |

### User
| Operation | Description |
|-----------|-------------|
| Get | Get user by ID |
| Get by Email | Find user by email |
| Get Many | List all Drata users |
| Get Roles | Get user roles and permissions |
| Get Activity | Get user activity log |

### Background Check
| Operation | Description |
|-----------|-------------|
| Get | Get background check by ID |
| Get Many | List all background checks |
| Get by Personnel | Get background checks for a person |
| Upload | Upload background check result |
| Update Status | Update background check status |

### Security Training
| Operation | Description |
|-----------|-------------|
| Get | Get training record by ID |
| Get Many | List all training records |
| Get by Personnel | Get training for a person |
| Get Overdue | Get overdue training |
| Upload | Upload training completion |
| Update Status | Update training status |

### Audit Event
| Operation | Description |
|-----------|-------------|
| Get | Get event by ID |
| Get Many | List all audit events |
| Get by Date Range | Get events within date range |
| Get by User | Get events by user |
| Get by Entity | Get events for specific entity |

## Trigger Node

The Drata Trigger node polls for compliance changes at configurable intervals.

### Supported Events

| Event | Description |
|-------|-------------|
| Control Status Changed | When control status changes |
| Personnel Compliance Changed | When a person's compliance status changes |
| Evidence Expiring | When evidence is approaching expiration |
| Vendor Risk Changed | When vendor risk rating changes |
| Training Overdue | When training becomes overdue |
| Background Check Expiring | When background check expires soon |
| Policy Acknowledgment Pending | When policy needs acknowledgment |
| Audit Event Created | When significant audit event occurs |

### Trigger Options

- **Days Before Expiry**: Number of days before expiry to trigger (for expiration events)
- **Framework ID**: Filter by specific framework (for control events)
- **Include Details**: Include full entity details in the output

## Usage Examples

### Get All Failing Controls

```json
{
  "resource": "control",
  "operation": "getAll",
  "filters": {
    "status": "FAILING"
  }
}
```

### Create a New Vendor

```json
{
  "resource": "vendor",
  "operation": "create",
  "vendorName": "Cloud Provider Inc",
  "category": "Infrastructure",
  "riskRating": "MEDIUM"
}
```

### Upload Evidence to Control

```json
{
  "resource": "control",
  "operation": "uploadEvidence",
  "controlId": 123,
  "binaryPropertyName": "data",
  "additionalFields": {
    "description": "Monthly security scan results",
    "expirationDate": "2025-12-31"
  }
}
```

### Create a Risk Entry

```json
{
  "resource": "risk",
  "operation": "create",
  "title": "Data Breach Risk",
  "category": "SECURITY",
  "likelihood": "POSSIBLE",
  "impact": "MAJOR"
}
```

## Compliance Concepts

### Control Status
- **PASSING**: Control meets compliance requirements
- **FAILING**: Control does not meet requirements
- **NOT_APPLICABLE**: Control is not applicable
- **DISABLED**: Control is disabled

### Risk Assessment
- **Likelihood**: RARE, UNLIKELY, POSSIBLE, LIKELY, ALMOST_CERTAIN
- **Impact**: NEGLIGIBLE, MINOR, MODERATE, MAJOR, SEVERE
- **Categories**: OPERATIONAL, FINANCIAL, COMPLIANCE, SECURITY, STRATEGIC

### Framework Types
- SOC 2 Type 1 & Type 2
- ISO 27001
- HIPAA
- GDPR
- PCI DSS
- SOX

## Error Handling

The node handles common API errors:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - API key lacks required scope |
| 404 | Not Found - Resource does not exist |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

Rate limit handling includes automatic exponential backoff (1s, 2s, 4s, 8s) with a maximum of 3 retry attempts.

## Security Best Practices

1. **API Key Security**: Store API keys securely using n8n's credential system
2. **Minimal Permissions**: Create API keys with only the required scope permissions
3. **Key Rotation**: Regularly rotate API keys and set expiration dates
4. **Audit Logging**: Monitor audit events for suspicious activity
5. **Access Control**: Limit who can access workflows with Drata credentials

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

Please ensure your code passes linting and all tests before submitting.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-drata/issues)
- **Drata API Docs**: [developers.drata.com](https://developers.drata.com/docs/)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)

## Acknowledgments

- [Drata](https://drata.com) for the compliance automation platform
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for node development resources
