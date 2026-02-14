# Dashboard Version Comparison

Complete feature comparison across Small Business, Medium Business, and Enterprise dashboards.

## Quick Reference Table

| Feature | Small Business | Medium Business | Enterprise |
|---------|---------------|-----------------|------------|
| **Target Users** | 1-3 person teams | 5-20 person teams | 20+ person teams, multi-region |
| **Max Contributors** | 3 (limit enforced) | Unlimited | Unlimited |
| **Max QR Codes** | 5 (limit enforced) | Unlimited | Unlimited |
| **Storage** | 250 GB | 500 GB | 1 TB+ |
| **Price** | Free | $29/month | Custom pricing |

---

## Core Features

| Feature | Small Business | Medium Business | Enterprise |
|---------|---------------|-----------------|------------|
| **Dashboard** | ✅ Basic stats | ✅ Enhanced stats | ✅ Advanced analytics |
| **Uploads** | ✅ All file types | ✅ All file types | ✅ All file types |
| **QR Codes** | ✅ Up to 5 codes | ✅ Unlimited | ✅ Unlimited |
| **Campaigns** | ✅ Basic campaigns | ✅ Full campaigns | ✅ Advanced campaigns |
| **Activity Tracking** | ✅ All activity | ✅ All activity | ✅ All activity |
| **Settings** | ✅ Basic settings | ✅ Full settings | ✅ Advanced settings |
| **Contributors** | ✅ Up to 3 | ✅ Unlimited | ✅ Unlimited |
| **Billing** | ✅ Basic billing | ✅ Full billing | ✅ Enterprise billing |
| **Profile** | ✅ User profile | ✅ User profile | ✅ User profile |

---

## Advanced Features

| Feature | Small Business | Medium Business | Enterprise |
|---------|---------------|-----------------|------------|
| **Messages (Internal)** | ❌ Removed | ✅ Team messaging | ✅ Team messaging |
| **Messages (External)** | ❌ Removed | ✅ External comms | ✅ External comms |
| **Analytics Page** | ❌ Removed | ✅ Dedicated page | ✅ Advanced analytics |
| **Social Media Sharing** | ✅ Facebook, Twitter, LinkedIn, Instagram | ✅ Facebook, Twitter, LinkedIn, Instagram | ✅ Facebook, Twitter, LinkedIn, Instagram |
| **Cohorts** | ❌ Not available | ❌ Not available | ✅ User group management |
| **Workflows** | ❌ Not available | ❌ Not available | ✅ Approval process |
| **Organizations** | ❌ Not available | ❌ Not available | ✅ Multi-brand support |
| **Audit Log** | ❌ Not available | ❌ Not available | ✅ Change tracking |
| **Compliance** | ❌ Not available | ❌ Not available | ✅ Delivery analytics |

---

## Export Options

| Export Type | Small Business | Medium Business | Enterprise |
|-------------|---------------|-----------------|------------|
| **CSV** | ✅ Available | ✅ Available | ✅ Available |
| **Excel** | ❌ Upgrade to unlock | ✅ Available | ✅ Available |
| **PDF** | ❌ Upgrade to unlock | ❌ Upgrade to unlock | ✅ Available |
| **Custom Export** | ❌ Not available | ❌ Not available | ✅ Available |

---

## Role Permissions

| Version | Available Roles | Description |
|---------|----------------|-------------|
| **Small Business** | Admin, Editor | Simplified 2-role system for small teams |
| **Medium Business** | Admin, Manager, Editor, Viewer | 4-role system with viewing permissions |
| **Enterprise** | Super Admin, Admin, Manager, Publisher, Reviewer, Editor, Viewer | 7-role system with granular permissions |

### Role Definitions

#### Small Business Roles
- **Admin** - Full access to all features and settings
- **Editor** - Can create and edit content, limited settings access

#### Medium Business Roles
- **Admin** - Full access to all features and settings
- **Manager** - Manage team members and campaigns, view analytics
- **Editor** - Create and edit content
- **Viewer** - Read-only access to content and analytics

#### Enterprise Roles
- **Super Admin** - Full system access across all organizations
- **Admin** - Full access within organization
- **Manager** - Team and campaign management
- **Publisher** - Content publishing after approval
- **Reviewer** - Content review and approval
- **Editor** - Content creation and editing
- **Viewer** - Read-only access

---

## Limits & Restrictions

### Small Business
- **Contributors**: 3 maximum (enforced with upgrade prompt)
- **QR Codes**: 5 maximum (enforced with upgrade prompt)
- **Storage**: 250 GB
- **Export**: CSV only
- **Roles**: 2 role types
- **Messages**: Not available
- **Advanced Features**: None

### Medium Business
- **Contributors**: Unlimited
- **QR Codes**: Unlimited
- **Storage**: 500 GB
- **Export**: CSV + Excel
- **Roles**: 4 role types
- **Messages**: Internal + External
- **Advanced Features**: Analytics page

### Enterprise
- **Contributors**: Unlimited
- **QR Codes**: Unlimited
- **Storage**: 1 TB+
- **Export**: CSV + Excel + PDF + Custom
- **Roles**: 7 role types
- **Messages**: Internal + External
- **Advanced Features**: Cohorts, Workflows, Organizations, Audit Log, Compliance

---

## Navigation Sections

### Small Business (7 sections)
1. Dashboard
2. Uploads
3. QR Codes
4. Campaigns
5. All Activity
6. Contributors (Settings)
7. Billing & Profile (Settings)

### Medium Business (10 sections)
1. Dashboard
2. Uploads
3. QR Codes
4. Campaigns
5. Messages (Internal/External)
6. Analytics
7. All Activity
8. Contributors (Settings)
9. Billing (Settings)
10. Profile (Settings)

### Enterprise (15+ sections)
1. Dashboard
2. Uploads
3. QR Codes
4. Campaigns
5. Messages (Internal/External)
6. Analytics
7. All Activity
8. **Cohorts** (Enterprise)
9. **Workflows** (Enterprise)
10. **Organizations** (Enterprise)
11. **Audit Log** (Enterprise)
12. **Compliance** (Enterprise)
13. Contributors (Settings)
14. Billing (Settings)
15. Profile (Settings)

---

## Upgrade Prompts

### Small Business → Medium Business
Upgrade prompts appear when:
- Trying to add 4th contributor
- Trying to create 6th QR code
- Accessing export options (Excel/PDF)
- Clicking "Upgrade Plan" in billing

**Benefits highlighted:**
- Unlimited contributors
- Unlimited QR codes
- Team messaging (internal & external)
- Advanced analytics dashboard
- Export to Excel & CSV
- $29/month

### Medium Business → Enterprise
Upgrade available for:
- Advanced role management (7 roles)
- Cohort management
- Workflow approvals
- Multi-brand/organization support
- Audit logging
- Compliance tracking
- PDF & Custom exports
- Custom pricing

---

## File References

- **Small Business**: [Dashboard_SmallBusiness.jsx](src/Dashboard_SmallBusiness.jsx)
- **Medium Business**: [Dashboard_MediumBusiness.jsx](src/Dashboard_MediumBusiness.jsx)
- **Enterprise**: [Dashboard_Enterprise.jsx](src/Dashboard_Enterprise.jsx)
- **Version Switcher**: [App.jsx](src/App.jsx)

---

## Switching Between Versions

### Method 1: Edit App.jsx
Uncomment the desired version import in `src/App.jsx`:

```javascript
// Small Business
import Dashboard from './Dashboard_SmallBusiness'

// Medium Business (DEFAULT)
// import Dashboard from './Dashboard_MediumBusiness'

// Enterprise
// import Dashboard from './Dashboard_Enterprise'
```

### Method 2: Command Line (Windows)
Use the provided batch files:

```bash
switch-small.bat      # Switch to Small Business
switch-medium.bat     # Switch to Medium Business
switch-enterprise.bat # Switch to Enterprise
```

---

## Recommended Use Cases

### Small Business
**Best for:**
- Solo entrepreneurs
- 1-3 person teams
- Basic QR code management
- Simple campaign tracking
- Limited budget

**Not suitable for:**
- Teams larger than 3 people
- Need for team messaging
- Advanced analytics requirements
- Multiple QR codes (>5)

### Medium Business
**Best for:**
- Growing teams (5-20 people)
- Internal team collaboration
- Client communications
- Detailed analytics needs
- Multiple campaigns

**Not suitable for:**
- Enterprise compliance requirements
- Multi-brand management
- Complex approval workflows
- Advanced role hierarchies

### Enterprise
**Best for:**
- Large organizations (20+ people)
- Multi-region operations
- Multiple brands/departments
- Strict compliance requirements
- Complex approval workflows
- Advanced user permissions
- Audit trail needs

---

## Summary

Choose the version that best fits your team size, budget, and feature requirements. The system is designed to grow with your business, making it easy to upgrade as your needs expand.

**Quick Decision Guide:**
- **1-3 people, basic needs** → Small Business
- **5-20 people, team collaboration** → Medium Business
- **20+ people, enterprise features** → Enterprise
