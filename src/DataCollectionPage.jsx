// DATA COLLECTION PAGE
// Visual guide to what data is collected, how it's stored, and input guidelines

import React, { useState } from 'react';
import {
  Users, Building2, QrCode, MousePointer, Mail, MessageSquare,
  CreditCard, Globe, Clock, Database, CheckCircle, AlertTriangle,
  FileText, TrendingUp, Settings, Shield
} from 'lucide-react';

export default function DataCollectionPage() {
  const [activeTab, setActiveTab] = useState('what-we-collect');

  const dataCategories = [
    {
      icon: Users,
      title: 'User Information',
      color: 'blue',
      items: [
        { label: 'Name', example: 'John Smith', format: 'Text (50 chars max)' },
        { label: 'Email', example: 'john@company.com', format: 'Email format required' },
        { label: 'Phone', example: '+1-555-0123', format: 'International format' },
        { label: 'Profile Photo', example: 'photo.jpg', format: 'JPG/PNG (max 2MB)' }
      ],
      howCollected: 'User enters during sign-up or in profile settings',
      whenStored: 'Immediately upon form submission',
      storage: 'Encrypted in users table'
    },
    {
      icon: Building2,
      title: 'Organization Details',
      color: 'purple',
      items: [
        { label: 'Company Name', example: 'Acme Corp', format: 'Text (100 chars max)' },
        { label: 'Industry', example: 'Technology', format: 'Dropdown selection' },
        { label: 'Team Size', example: '10-50 employees', format: 'Range selection' },
        { label: 'Website', example: 'www.acme.com', format: 'Valid URL format' }
      ],
      howCollected: 'Organization owner enters during onboarding',
      whenStored: 'During organization creation',
      storage: 'organizations table with foreign key to owner'
    },
    {
      icon: QrCode,
      title: 'QR Code Data',
      color: 'green',
      items: [
        { label: 'QR Code Name', example: 'Holiday Campaign', format: 'Text (100 chars)' },
        { label: 'Destination URL', example: 'https://site.com/promo', format: 'Valid HTTPS URL' },
        { label: 'Created Date', example: '2026-01-31', format: 'Auto-generated timestamp' },
        { label: 'QR Image', example: 'qr_abc123.png', format: 'Auto-generated PNG' }
      ],
      howCollected: 'User creates via QR Code Generator tool',
      whenStored: 'Immediately when QR code is generated',
      storage: 'qr_codes table with link to content and organization'
    },
    {
      icon: MousePointer,
      title: 'Scan Analytics',
      color: 'orange',
      items: [
        { label: 'Scan Time', example: '2026-01-31 14:23:45', format: 'Timestamp (UTC)' },
        { label: 'Location', example: 'New York, USA', format: 'City, Country from IP' },
        { label: 'Device Type', example: 'iPhone 15', format: 'Auto-detected from user agent' },
        { label: 'IP Address', example: '192.168.1.1', format: 'IPv4/IPv6 (anonymized after 90 days)' }
      ],
      howCollected: 'Automatically when someone scans a QR code',
      whenStored: 'Real-time upon scan event',
      storage: 'scans table with reference to qr_code_id'
    },
    {
      icon: MessageSquare,
      title: 'Messages & Communications',
      color: 'pink',
      items: [
        { label: 'Message Text', example: 'Thanks for scanning!', format: 'Text (500 chars max)' },
        { label: 'Recipient', example: 'Team member or external', format: 'User ID or email' },
        { label: 'Sent Date', example: '2026-01-31 09:15:00', format: 'Auto-timestamp' },
        { label: 'Read Status', example: 'Read/Unread', format: 'Boolean flag' }
      ],
      howCollected: 'User composes via Messages tab in dashboard',
      whenStored: 'When user clicks Send',
      storage: 'messages table with sender_id and recipient_id'
    },
    {
      icon: CreditCard,
      title: 'Billing & Subscriptions',
      color: 'yellow',
      items: [
        { label: 'Plan Type', example: 'Medium Business', format: 'Enum (Personal/Small/Medium/Enterprise)' },
        { label: 'Billing Cycle', example: 'Monthly', format: 'Monthly or Annual' },
        { label: 'Payment Method', example: 'Visa ****1234', format: 'Last 4 digits only' },
        { label: 'Next Billing Date', example: '2026-02-28', format: 'Date (YYYY-MM-DD)' }
      ],
      howCollected: 'User selects plan and enters payment info',
      whenStored: 'During checkout flow (payment via Stripe)',
      storage: 'subscriptions table, payment tokens in Stripe only'
    }
  ];

  const inputGuidelines = [
    {
      category: 'Text Fields',
      icon: FileText,
      rules: [
        { rule: 'Character Limits', description: 'Always enforce max length to prevent database overflow', impact: 'Database fields are sized appropriately' },
        { rule: 'Trim Whitespace', description: 'Remove leading/trailing spaces before saving', impact: 'Prevents duplicate entries with spaces' },
        { rule: 'Sanitize Input', description: 'Remove HTML/script tags for security', impact: 'Prevents XSS attacks' },
        { rule: 'Case Sensitivity', description: 'Store emails in lowercase for consistency', impact: 'Easier matching and duplicate detection' }
      ]
    },
    {
      category: 'Dates & Times',
      icon: Clock,
      rules: [
        { rule: 'UTC Storage', description: 'Always store dates/times in UTC timezone', impact: 'Consistent data across global users' },
        { rule: 'ISO 8601 Format', description: 'Use YYYY-MM-DD HH:mm:ss format', impact: 'Standardized parsing and sorting' },
        { rule: 'Timestamp Fields', description: 'created_at and updated_at on all tables', impact: 'Audit trail and change tracking' },
        { rule: 'Date Validation', description: 'Ensure dates are realistic (not future for birthdates)', impact: 'Data quality and accuracy' }
      ]
    },
    {
      category: 'File Uploads',
      icon: Database,
      rules: [
        { rule: 'File Type Validation', description: 'Only allow specified formats (JPG, PNG, PDF)', impact: 'Security and storage efficiency' },
        { rule: 'Size Limits', description: 'Enforce max file size (2MB for images)', impact: 'Prevents server overload' },
        { rule: 'Filename Sanitization', description: 'Remove special characters, use UUIDs', impact: 'Prevents path traversal attacks' },
        { rule: 'Virus Scanning', description: 'Scan all uploads for malware', impact: 'System and user security' }
      ]
    },
    {
      category: 'Numeric Fields',
      icon: TrendingUp,
      rules: [
        { rule: 'Data Type Enforcement', description: 'Use integer/decimal types, not strings', impact: 'Proper sorting and math operations' },
        { rule: 'Range Validation', description: 'Set min/max values (e.g., team size 1-10000)', impact: 'Realistic data constraints' },
        { rule: 'Currency Precision', description: 'Store prices with 2 decimal places', impact: 'Accurate financial calculations' },
        { rule: 'Negative Values', description: 'Decide if negatives are allowed per field', impact: 'Business logic consistency' }
      ]
    }
  ];

  const dataFlowSteps = [
    {
      step: 1,
      title: 'User Input',
      description: 'User enters data via form, dashboard, or API',
      color: 'blue',
      icon: Users
    },
    {
      step: 2,
      title: 'Client Validation',
      description: 'JavaScript validates format, required fields, length',
      color: 'purple',
      icon: CheckCircle
    },
    {
      step: 3,
      title: 'Server Validation',
      description: 'Backend double-checks all validations for security',
      color: 'orange',
      icon: Shield
    },
    {
      step: 4,
      title: 'Data Processing',
      description: 'Sanitize, format, encrypt sensitive fields',
      color: 'green',
      icon: Settings
    },
    {
      step: 5,
      title: 'Database Storage',
      description: 'Insert/update in appropriate table with relationships',
      color: 'cyan',
      icon: Database
    },
    {
      step: 6,
      title: 'Confirmation',
      description: 'Success response sent to user with saved data',
      color: 'pink',
      icon: CheckCircle
    }
  ];

  const storageImpact = [
    {
      title: 'Consistent Formatting = Better Queries',
      example: 'Phone numbers stored as +1-555-0123 vs (555) 0123 vs 555.0123',
      impact: 'With consistent format, searching and matching is reliable',
      badExample: '3 different formats = can\'t find duplicates',
      goodExample: 'One format = easy duplicate detection'
    },
    {
      title: 'Proper Data Types = Faster Performance',
      example: 'Storing dates as "January 31, 2026" vs 2026-01-31',
      impact: 'Date type enables fast sorting, range queries, and date math',
      badExample: 'String dates = slow sorting, can\'t do date math',
      goodExample: 'Date type = instant sorting and calculations'
    },
    {
      title: 'Character Limits = Optimized Storage',
      example: 'Email field VARCHAR(255) vs unlimited TEXT',
      impact: 'Right-sized fields use less disk space and memory',
      badExample: 'TEXT fields use more resources, slower indexes',
      goodExample: 'VARCHAR(255) is perfect for emails, faster queries'
    },
    {
      title: 'Validation = Data Quality',
      example: 'Email validation catches "john@" before saving',
      impact: 'Clean data means campaigns reach users, no bounce',
      badExample: 'Invalid emails = failed campaigns, bad analytics',
      goodExample: 'Valid emails = successful delivery, accurate metrics'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Database className="mx-auto mb-4" size={64} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Collection Guide</h1>
            <p className="text-xl text-blue-100">
              Understanding what we collect, how we store it, and why it matters
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'what-we-collect', label: 'What We Collect', icon: Database },
              { id: 'input-guidelines', label: 'Input Guidelines', icon: Settings },
              { id: 'data-flow', label: 'How Data Flows', icon: TrendingUp },
              { id: 'storage-impact', label: 'Storage Impact', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What We Collect Tab */}
        {activeTab === 'what-we-collect' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Data We Collect</h2>
              <p className="text-lg text-slate-600">
                Here's a visual breakdown of all the data types we collect and how they're stored
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {dataCategories.map((category, idx) => (
                <div key={idx} className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
                  <div className={`bg-${category.color}-600 text-white p-6`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <category.icon size={24} />
                      </div>
                      <h3 className="text-2xl font-bold">{category.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{item.label}</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Example: <span className="font-mono text-blue-600">{item.example}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{item.format}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-slate-200 pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MousePointer size={12} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">How Collected</p>
                          <p className="text-sm text-slate-600">{category.howCollected}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock size={12} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">When Stored</p>
                          <p className="text-sm text-slate-600">{category.whenStored}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Database size={12} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">Storage Location</p>
                          <p className="text-sm text-slate-600">{category.storage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Guidelines Tab */}
        {activeTab === 'input-guidelines' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Data Input Guidelines</h2>
              <p className="text-lg text-slate-600">
                How data should be formatted and validated before storage
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {inputGuidelines.map((guideline, idx) => (
                <div key={idx} className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center gap-3">
                      <guideline.icon size={32} />
                      <h3 className="text-2xl font-bold">{guideline.category}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guideline.rules.map((rule, ruleIdx) => (
                        <div key={ruleIdx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                              {ruleIdx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-2">{rule.rule}</h4>
                              <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-200">
                                <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                  <span className="font-semibold">Impact:</span> {rule.impact}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Flow Tab */}
        {activeTab === 'data-flow' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How Data Flows Through the System</h2>
              <p className="text-lg text-slate-600">
                From user input to secure database storage
              </p>
            </div>

            <div className="relative">
              {dataFlowSteps.map((step, idx) => (
                <div key={idx} className="mb-8 last:mb-0">
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 bg-${step.color}-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg`}>
                        {step.step}
                      </div>
                      {idx < dataFlowSteps.length - 1 && (
                        <div className="w-1 h-16 bg-slate-300 my-2"></div>
                      )}
                    </div>

                    <div className="flex-1 bg-white rounded-xl border-2 border-slate-200 shadow-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-${step.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <step.icon size={24} className={`text-${step.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                          <p className="text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-8 text-center">
              <CheckCircle className="mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">Data is Secured & Stored!</h3>
              <p className="text-green-100">
                Multiple validation layers ensure only clean, properly formatted data reaches the database
              </p>
            </div>
          </div>
        )}

        {/* Storage Impact Tab */}
        {activeTab === 'storage-impact' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Input Formatting Matters</h2>
              <p className="text-lg text-slate-600">
                How data input affects storage, performance, and data quality
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {storageImpact.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={32} />
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Example Scenario:</p>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {item.example}
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Impact on System:</p>
                      <p className="text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {item.impact}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">✗</span>
                          </div>
                          <p className="font-bold text-red-900">Bad Practice</p>
                        </div>
                        <p className="text-sm text-red-700">{item.badExample}</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">✓</span>
                          </div>
                          <p className="font-bold text-green-900">Good Practice</p>
                        </div>
                        <p className="text-sm text-green-700">{item.goodExample}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={24} className="flex-shrink-0" />
                  <p>Consistent formatting makes data searchable and reliable</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={24} className="flex-shrink-0" />
                  <p>Proper data types improve query performance significantly</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={24} className="flex-shrink-0" />
                  <p>Field size limits optimize storage and memory usage</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={24} className="flex-shrink-0" />
                  <p>Input validation ensures high data quality and accuracy</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
