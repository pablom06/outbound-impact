# Data Collection Summary - Outbound Impact

## Overview

This document outlines all data collected by the Outbound Impact platform, how it's collected, where it's stored, and what it's used for. **This is critical for database schema design and ensuring proper data architecture.**

---

## 1. User Account Data

### Personal/Authentication Data
**Collected At:** User Registration

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| User ID | UUID | Yes | Auto-generated | Unique identifier |
| Email | String | Yes | User input | Authentication, communication |
| Password Hash | String | Yes | Bcrypt hash | Security |
| Name | String | Yes | User input | Personalization |
| Phone | String | No | User input | Account recovery, 2FA |
| Created At | Timestamp | Yes | Auto-generated | Analytics, billing |
| Last Login | Timestamp | Yes | Auto-tracked | Security, analytics |
| Email Verified | Boolean | Yes | Verification link | Account security |
| 2FA Enabled | Boolean | Yes | User setting | Security |

**Database Table:** `users`

---

## 2. Organization Data

### Company/Team Information
**Collected At:** Account Setup, Settings

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Organization ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization Name | String | Yes | User input | Branding, invoicing |
| Plan Type | Enum | Yes | User selection | Feature access control |
| Billing Email | String | Yes | User input | Invoicing |
| Industry | String | No | User input | Analytics, targeting |
| Company Size | String | No | User input | Analytics, upselling |
| Website | URL | No | User input | Verification |
| Address | JSON | No | User input | Billing, compliance |
| Tax ID | String | No | User input | Invoicing |
| Created At | Timestamp | Yes | Auto-generated | Analytics |
| Subscription Status | Enum | Yes | Payment processor | Access control |
| Trial End Date | Timestamp | No | Auto-calculated | Trial management |

**Database Table:** `organizations`

**Plan Types:**
- `personal` - Free tier for individuals
- `small_business` - Free or $5/mo for 1-3 person teams
- `medium_business` - $29/mo with full features
- `enterprise` - $99/mo with advanced features

---

## 3. Content/Upload Data

### User-Generated Content
**Collected At:** Content Upload

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Content ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant isolation |
| User ID | UUID | Yes | Session context | Ownership tracking |
| File Name | String | Yes | File upload | Display |
| File Type | String | Yes | MIME detection | Processing |
| File Size | Integer | Yes | File metadata | Storage tracking |
| File URL | String | Yes | Storage service | Content delivery |
| Thumbnail URL | String | No | Auto-generated | Preview |
| Description | Text | No | User input | Organization |
| Tags | Array | No | User input | Search, filtering |
| Created At | Timestamp | Yes | Auto-generated | Sorting, analytics |
| Updated At | Timestamp | Yes | Auto-tracked | Version control |
| Deleted At | Timestamp | No | Soft delete | Data retention |
| Storage Provider | String | Yes | Config | Backup, migration |
| Storage Key | String | Yes | Upload result | Retrieval |

**Database Table:** `content`

**Storage:** Backblaze B2 / S3-compatible

---

## 4. QR Code Data

### QR Code Generation & Management
**Collected At:** QR Code Creation

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| QR Code ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant isolation |
| User ID | UUID | Yes | Session context | Creator tracking |
| Short Code | String | Yes | Auto-generated | URL shortening |
| Target URL | String | Yes | User input | Redirect destination |
| QR Image URL | String | Yes | Generation service | Display |
| Label/Name | String | No | User input | Organization |
| Campaign ID | UUID | No | User selection | Analytics grouping |
| Style Settings | JSON | No | User input | Customization |
| Created At | Timestamp | Yes | Auto-generated | Analytics |
| Active | Boolean | Yes | User toggle | Access control |
| Scan Count | Integer | Yes | Auto-incremented | Analytics |

**Database Table:** `qr_codes`

---

## 5. QR Code Scan Data ⚠️ CRITICAL FOR ANALYTICS

### Individual Scan Events
**Collected At:** QR Code Scan (Real-time)

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Scan ID | UUID | Yes | Auto-generated | Unique identifier |
| QR Code ID | UUID | Yes | URL parameter | Link to QR code |
| Organization ID | UUID | Yes | QR code lookup | Tenant analytics |
| Scanned At | Timestamp | Yes | Request time | Time-series analytics |
| IP Address | String | Yes | Request header | Geolocation |
| User Agent | String | Yes | Request header | Device detection |
| Device Type | String | Yes | UA parsing | Analytics |
| Browser | String | Yes | UA parsing | Analytics |
| OS | String | Yes | UA parsing | Analytics |
| Latitude | Float | No | IP geolocation | Geographic analytics |
| Longitude | Float | No | IP geolocation | Geographic analytics |
| City | String | No | IP geolocation | Analytics |
| Region | String | No | IP geolocation | Analytics |
| Country | String | Yes | IP geolocation | Analytics |
| Referrer | String | No | Request header | Source tracking |
| Language | String | No | Request header | Localization |

**Database Table:** `scans`

**Data Source:** IPInfo API for geolocation

**Privacy Note:** IP addresses are anonymized after 90 days (last octet removed)

---

## 6. Campaign Data

### Marketing Campaigns
**Collected At:** Campaign Creation

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Campaign ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant isolation |
| Name | String | Yes | User input | Display |
| Description | Text | No | User input | Documentation |
| Status | Enum | Yes | User action | State management |
| Start Date | Timestamp | No | User input | Scheduling |
| End Date | Timestamp | No | User input | Scheduling |
| Created At | Timestamp | Yes | Auto-generated | Analytics |
| Created By | UUID | Yes | Session context | Attribution |
| QR Code Count | Integer | Yes | Auto-calculated | Analytics |
| Total Scans | Integer | Yes | Auto-calculated | Performance |

**Database Table:** `campaigns`

**Status Values:** `draft`, `active`, `paused`, `completed`, `archived`

---

## 7. User Roles & Permissions

### Team Member Access Control
**Collected At:** User Invitation, Role Assignment

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Member ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Context | Tenant isolation |
| User ID | UUID | Yes | Invitation | Link to user |
| Role | Enum | Yes | Admin assignment | Access control |
| Permissions | JSON | No | Role-based | Granular control |
| Invited At | Timestamp | Yes | Auto-generated | Audit |
| Invited By | UUID | Yes | Session context | Audit |
| Accepted At | Timestamp | No | User action | Onboarding tracking |
| Last Active | Timestamp | Yes | Auto-tracked | Activity monitoring |

**Database Table:** `organization_members`

**Roles by Plan:**
- **Personal:** Owner only
- **Small Business:** Admin, Editor
- **Medium Business:** Admin, Manager, Editor, Viewer
- **Enterprise:** Admin, Manager, Editor, Viewer, Auditor, Compliance, Developer

---

## 8. Billing & Payment Data

### Subscription & Payment Tracking
**Collected At:** Checkout, Payment Processing

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Subscription ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Context | Billing association |
| Stripe Customer ID | String | Yes | Stripe API | Payment processing |
| Stripe Subscription ID | String | No | Stripe API | Subscription management |
| Plan Type | Enum | Yes | User selection | Feature access |
| Billing Cycle | Enum | Yes | User selection | Invoicing |
| Amount | Integer | Yes | Plan pricing | Revenue tracking |
| Currency | String | Yes | User selection | Multi-currency |
| Status | Enum | Yes | Stripe webhook | Access control |
| Current Period Start | Timestamp | Yes | Stripe | Billing period |
| Current Period End | Timestamp | Yes | Stripe | Billing period |
| Cancel At Period End | Boolean | Yes | User action | Churn tracking |
| Canceled At | Timestamp | No | User action | Churn analytics |

**Database Table:** `subscriptions`

**Payment Processor:** Stripe

**Webhook Events Tracked:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.updated`

---

## 9. Messages (Medium Business & Enterprise)

### Internal & External Communications
**Collected At:** Message Creation

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Message ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant isolation |
| Thread ID | UUID | No | User action | Conversation grouping |
| Sender ID | UUID | Yes | Session context | Attribution |
| Recipient ID | UUID | No | User selection | Delivery |
| Message Type | Enum | Yes | Context | Internal/External |
| Subject | String | No | User input | Display |
| Body | Text | Yes | User input | Content |
| Sent At | Timestamp | Yes | Auto-generated | Sorting |
| Read At | Timestamp | No | User action | Read receipts |
| Attachments | JSON | No | File upload | Content sharing |

**Database Table:** `messages`

**Message Types:** `internal`, `external`

---

## 10. Analytics Events

### User Behavior Tracking
**Collected At:** User Actions (Real-time)

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Event ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant analytics |
| User ID | UUID | No | Session context | User analytics |
| Event Type | String | Yes | Action trigger | Event categorization |
| Event Data | JSON | No | Context | Additional metadata |
| Timestamp | Timestamp | Yes | Auto-generated | Time-series |
| Session ID | String | No | Cookie | Session tracking |
| Page URL | String | No | Request | Navigation tracking |

**Database Table:** `analytics_events`

**Event Types:**
- `qr_code_created`
- `qr_code_scanned`
- `content_uploaded`
- `campaign_created`
- `user_invited`
- `export_generated`
- `login`
- `logout`
- `settings_updated`
- `subscription_upgraded`
- `subscription_downgraded`

---

## 11. Exports & Downloads

### Data Export Tracking
**Collected At:** Export Generation

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Export ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Session context | Tenant tracking |
| User ID | UUID | Yes | Session context | Attribution |
| Export Type | String | Yes | User selection | Content type |
| Format | String | Yes | User selection | File format |
| File URL | String | Yes | Generation result | Download |
| File Size | Integer | Yes | File metadata | Storage tracking |
| Created At | Timestamp | Yes | Auto-generated | Audit |
| Expires At | Timestamp | Yes | Auto-calculated | Cleanup |
| Downloaded At | Timestamp | No | User action | Usage tracking |

**Database Table:** `exports`

**Export Types:** `customers`, `scans`, `analytics`, `campaigns`, `qr_codes`

**Formats by Plan:**
- Small Business: CSV only
- Medium Business: CSV, Excel
- Enterprise: CSV, Excel, PDF, Custom

---

## 12. Notifications

### User Notifications
**Collected At:** Notification Creation

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Notification ID | UUID | Yes | Auto-generated | Unique identifier |
| Organization ID | UUID | Yes | Context | Tenant isolation |
| User ID | UUID | Yes | Target user | Delivery |
| Type | Enum | Yes | Event trigger | Display styling |
| Category | Enum | Yes | Event trigger | Settings filter |
| Title | String | Yes | Template | Display |
| Message | Text | Yes | Template | Display |
| Action URL | String | No | Context | Navigation |
| Created At | Timestamp | Yes | Auto-generated | Sorting |
| Read At | Timestamp | No | User action | Read status |
| Dismissed At | Timestamp | No | User action | Cleanup |

**Database Table:** `notifications`

**Types:** `info`, `success`, `alert`, `error`

**Categories:** `product_updates`, `campaigns`, `limits`, `billing`, `security`, `marketing`

---

## 13. Discount Codes

### Promotional Codes (OI Admin)
**Collected At:** Code Creation (Admin)

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Code ID | UUID | Yes | Auto-generated | Unique identifier |
| Code | String | Yes | Admin input | Redemption |
| Discount Type | Enum | Yes | Admin selection | Calculation |
| Value | Integer | Yes | Admin input | Discount amount |
| Valid From | Timestamp | Yes | Admin input | Validity period |
| Valid Until | Timestamp | Yes | Admin input | Expiration |
| Usage Limit | Integer | No | Admin input | Redemption cap |
| Usage Count | Integer | Yes | Auto-incremented | Tracking |
| Applies To Plans | Array | Yes | Admin selection | Eligibility |
| Active | Boolean | Yes | Admin toggle | Availability |
| Created By | UUID | Yes | Session context | Audit |

**Database Table:** `discount_codes`

---

## 14. Admin Campaigns (OI Admin)

### Targeted Customer Communications
**Collected At:** Campaign Creation (Admin)

| Field | Type | Required | Collection Method | Purpose |
|-------|------|----------|-------------------|---------|
| Admin Campaign ID | UUID | Yes | Auto-generated | Unique identifier |
| Name | String | Yes | Admin input | Display |
| Message | Text | Yes | Admin input | Content |
| Type | Enum | Yes | Admin selection | Delivery method |
| Target Plans | Array | Yes | Admin selection | Filtering |
| Member Since Min | Integer | No | Admin input | Filtering |
| Member Since Max | Integer | No | Admin input | Filtering |
| Min QR Codes | Integer | No | Admin input | Filtering |
| Min Users | Integer | No | Admin input | Filtering |
| Geography | String | No | Admin input | Filtering |
| Estimated Reach | Integer | Yes | Auto-calculated | Preview |
| Recipients Count | Integer | No | Actual send | Analytics |
| Opens Count | Integer | No | Email tracking | Analytics |
| Clicks Count | Integer | No | Link tracking | Analytics |
| Sent At | Timestamp | No | Send action | Analytics |
| Created By | UUID | Yes | Session context | Audit |

**Database Table:** `admin_campaigns`

---

## Additional Data to Consider Collecting

### 1. **A/B Testing Data**
- Experiment ID
- Variant ID
- Conversion events
- User assignment

**Purpose:** Feature optimization, pricing experiments

### 2. **Feature Usage Metrics**
- Feature name
- Usage count per organization
- Time spent per feature
- Feature adoption rate

**Purpose:** Product decisions, feature sunsetting

### 3. **Error Logs**
- Error type
- Stack trace
- User context
- Frequency

**Purpose:** Bug fixing, reliability monitoring

### 4. **Performance Metrics**
- Page load times
- API response times
- Database query performance
- Third-party API latency

**Purpose:** Performance optimization

### 5. **Customer Support Data**
- Ticket ID
- Category
- Priority
- Resolution time
- Satisfaction score

**Purpose:** Support quality, product improvements

### 6. **Social Sharing Data** (Already tracked in campaigns)
- Share platform
- Share timestamp
- Share source (QR code, campaign)
- Referral conversions

**Purpose:** Viral growth, marketing attribution

### 7. **Email Engagement**
- Email ID
- Open rate
- Click rate
- Bounce rate
- Unsubscribe rate

**Purpose:** Email effectiveness, deliverability

### 8. **Device Fingerprinting** (Privacy-compliant)
- Screen resolution
- Timezone
- Installed fonts (hashed)
- Canvas fingerprint (hashed)

**Purpose:** Fraud prevention, duplicate detection

### 9. **NPS (Net Promoter Score)**
- Score (0-10)
- Feedback text
- Survey date
- Follow-up consent

**Purpose:** Customer satisfaction, testimonials

### 10. **Referral Program Data**
- Referrer ID
- Referee ID
- Referral code
- Conversion status
- Reward status

**Purpose:** Growth tracking, reward distribution

---

## Data Retention Policies

### Active Data
- **User accounts:** Retained while account is active
- **QR scans:** Retained for 2 years
- **Analytics events:** Retained for 1 year
- **Exports:** Auto-deleted after 7 days

### Anonymization
- **IP addresses:** Last octet removed after 90 days
- **User agents:** Parsed to device type, raw data deleted after 90 days
- **Geographic data:** City-level only after 90 days (lat/long removed)

### Deletion
- **Account deletion:** 30-day grace period, then hard delete
- **GDPR requests:** Processed within 30 days
- **Backups:** Retained for 90 days

---

## Privacy & Compliance

### GDPR Compliance
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Data subject rights (access, deletion, portability)
- ✅ Consent management
- ✅ Breach notification procedures

### Data Security
- ✅ Encryption at rest (database)
- ✅ Encryption in transit (TLS/SSL)
- ✅ Hashed passwords (bcrypt)
- ✅ API authentication (JWT)
- ✅ Row-level security (tenant isolation)
- ✅ Regular backups
- ✅ Access logging

---

## Database Schema Priorities

### Critical Tables (Must Have)
1. `users` - Authentication
2. `organizations` - Tenant management
3. `qr_codes` - Core product
4. `scans` - Analytics foundation
5. `subscriptions` - Revenue tracking

### Important Tables (High Priority)
6. `content` - Content management
7. `campaigns` - Marketing
8. `organization_members` - Team collaboration
9. `analytics_events` - Behavior tracking
10. `notifications` - User engagement

### Secondary Tables (Medium Priority)
11. `messages` - Communication (Medium+ plans)
12. `exports` - Data portability
13. `discount_codes` - Marketing (Admin)
14. `admin_campaigns` - Customer engagement (Admin)

### Enhancement Tables (Nice to Have)
15. `support_tickets` - Customer service
16. `feature_usage` - Product analytics
17. `error_logs` - Debugging
18. `email_campaigns` - Marketing automation
19. `referrals` - Growth tracking

---

## Summary

This data collection strategy supports:
- ✅ Multi-tenant SaaS architecture
- ✅ Plan-based feature access
- ✅ Geographic analytics and monetization
- ✅ Customer segmentation and targeting
- ✅ Revenue optimization
- ✅ Product analytics and improvement
- ✅ Privacy compliance (GDPR, CCPA)
- ✅ Data-driven decision making

**Total Core Tables:** 14
**Total Enhancement Tables:** 5
**Estimated Initial Schema Size:** ~50-60 columns per core table

---

**Last Updated:** January 31, 2026
**Version:** 1.0
