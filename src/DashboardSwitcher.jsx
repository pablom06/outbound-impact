// DASHBOARD SWITCHER
// Switch between dashboard tiers, data collection, and technical docs

import React, { useState } from 'react';
import { Building2, Users, User, ChevronDown, Database, FileText, GitBranch, Download, Shield, Wrench } from 'lucide-react';

// Import all dashboard components
import Dashboard_Personal from './Dashboard_Personal';
import Dashboard_SmallBusiness from './Dashboard_SmallBusiness';
import Dashboard_MediumBusiness from './Dashboard_MediumBusiness';
import Dashboard_Enterprise from './Dashboard_Enterprise';
import Dashboard_OIAdmin from './Dashboard_OIAdmin';

// Import documentation components
import DataCollectionPage from './DataCollectionPage';
import MarkdownViewer from './MarkdownViewer';

export default function DashboardSwitcher() {
  const [activeView, setActiveView] = useState('oi-admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const views = {
    dashboards: [
      {
        id: 'oi-admin',
        name: 'OI Admin Dashboard',
        description: 'Internal company dashboard - View ALL customer data',
        icon: Building2,
        component: Dashboard_OIAdmin,
        color: 'bg-gradient-to-r from-purple-600 to-blue-600'
      },
      {
        id: 'personal',
        name: 'Personal Dashboard',
        description: 'Free tier for individuals - 3 uploads, 1GB storage',
        icon: User,
        component: Dashboard_Personal,
        color: 'bg-gradient-to-r from-pink-500 to-purple-600'
      },
      {
        id: 'small-business',
        name: 'Small Business Dashboard',
        description: 'For 1-3 person teams',
        icon: Users,
        component: Dashboard_SmallBusiness,
        color: 'bg-blue-600'
      },
      {
        id: 'medium-business',
        name: 'Medium Business Dashboard',
        description: 'For growing teams with messaging & analytics',
        icon: Users,
        component: Dashboard_MediumBusiness,
        color: 'bg-purple-600'
      },
      {
        id: 'enterprise',
        name: 'Enterprise Dashboard',
        description: 'Advanced features for large organizations',
        icon: Users,
        component: Dashboard_Enterprise,
        color: 'bg-green-600'
      }
    ],
    documentation: [
      {
        id: 'data-collection-summary',
        name: 'Data Collection Summary',
        description: 'Visual guide to data collected and stored',
        icon: Database,
        component: DataCollectionPage,
        color: 'bg-gradient-to-r from-blue-600 to-cyan-600'
      }
    ],
    technicalDocumentation: [
      {
        id: 'complete-system-guide',
        name: 'Complete System Guide',
        description: 'Full system architecture and setup documentation',
        icon: FileText,
        component: () => <MarkdownViewer filePath="/COMPLETE_SYSTEM_GUIDE.md" title="Complete System Guide" />,
        color: 'bg-slate-700'
      },
      {
        id: 'customer-export-guide',
        name: 'Complete Export Guide',
        description: 'Customer data export system documentation',
        icon: Download,
        component: () => <MarkdownViewer filePath="/CUSTOMER_EXPORT_GUIDE.md" title="Complete Export Guide" />,
        color: 'bg-slate-700'
      },
      {
        id: 'data-flow-extraction',
        name: 'Data Flow and Extraction',
        description: 'How data flows through the system',
        icon: GitBranch,
        component: () => <MarkdownViewer filePath="/DATA_FLOW_AND_EXTRACTION.md" title="Data Flow and Extraction" />,
        color: 'bg-slate-700'
      },
      {
        id: 'database-architecture',
        name: 'Database Architecture',
        description: 'Database design and structure documentation',
        icon: Database,
        component: () => <MarkdownViewer filePath="/DATABASE_ARCHITECTURE.md" title="Database Architecture" />,
        color: 'bg-slate-700'
      },
      {
        id: 'oi-admin-guide',
        name: 'OI Admin Complete Guide',
        description: 'Internal admin dashboard documentation',
        icon: Shield,
        component: () => <MarkdownViewer filePath="/OI_ADMIN_COMPLETE_GUIDE.md" title="OI Admin Complete Guide" />,
        color: 'bg-slate-700'
      }
    ],
    integration: [
      {
        id: 'integration-guide',
        name: 'Integration Guide',
        description: 'How to deploy with Railway, Bunny.net, SendGrid, and Vercel',
        icon: Wrench,
        component: () => <MarkdownViewer filePath="/INTEGRATION_GUIDE.md" title="Developer Integration Guide" />,
        color: 'bg-gradient-to-r from-orange-600 to-red-600'
      }
    ]
  };

  const allViews = [...views.dashboards, ...views.documentation, ...views.technicalDocumentation, ...views.integration];
  const currentView = allViews.find(v => v.id === activeView);
  const ViewComponent = currentView.component;

  const renderViewButton = (view) => (
    <button
      key={view.id}
      onClick={() => {
        setActiveView(view.id);
        setDropdownOpen(false);
      }}
      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
        activeView === view.id ? 'bg-purple-50' : ''
      }`}
    >
      <div className={`w-10 h-10 ${view.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <view.icon size={20} className="text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-semibold text-sm ${
          activeView === view.id ? 'text-purple-700' : 'text-slate-900'
        }`}>
          {view.name}
          {activeView === view.id && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full">
              Active
            </span>
          )}
        </p>
        <p className="text-xs text-slate-600 mt-0.5">{view.description}</p>
      </div>
    </button>
  );

  return (
    <div className="relative h-screen w-screen">
      {/* Fixed Switcher Button - Top Left */}
      <div className="fixed top-4 left-4 z-[9999]">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`${currentView.color} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <currentView.icon size={20} />
            <span className="font-medium hidden sm:inline">{currentView.name}</span>
            <span className="font-medium sm:hidden">Switch View</span>
            <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setDropdownOpen(false)}
              ></div>

              {/* Menu */}
              <div className="absolute left-0 mt-2 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border border-slate-200 z-[9999] overflow-y-auto">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-10">
                  <p className="text-sm font-bold">Outbound Impact</p>
                  <p className="text-xs text-purple-100">Dashboard Platform</p>
                </div>

                {/* Dashboards Section */}
                <div className="py-2">
                  <div className="px-4 py-2 bg-slate-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <Building2 size={14} />
                      Dashboards
                    </p>
                  </div>
                  {views.dashboards.map(renderViewButton)}
                </div>

                {/* Data Collection Section */}
                <div className="py-2 border-t border-slate-200">
                  <div className="px-4 py-2 bg-slate-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <Database size={14} />
                      Documentation
                    </p>
                  </div>
                  {views.documentation.map(renderViewButton)}
                </div>

                {/* Technical Documentation Section */}
                <div className="py-2 border-t border-slate-200">
                  <div className="px-4 py-2 bg-slate-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <FileText size={14} />
                      Technical Documentation
                    </p>
                  </div>
                  {views.technicalDocumentation.map(renderViewButton)}
                </div>

                {/* Integration Section */}
                <div className="py-2 border-t border-slate-200">
                  <div className="px-4 py-2 bg-slate-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <Wrench size={14} />
                      Integration
                    </p>
                  </div>
                  {views.integration.map(renderViewButton)}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 sticky bottom-0">
                  <p className="text-xs text-slate-500">
                    5 Dashboards + 6 Documentation + Integration Guide
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="h-screen w-screen overflow-auto">
        <ViewComponent />
      </div>
    </div>
  );
}
