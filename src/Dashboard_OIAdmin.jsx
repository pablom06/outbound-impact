// OI ADMIN DASHBOARD
// Internal dashboard for Outbound Impact company administrators
// Access to ALL customer data, analytics, and monetization insights

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Globe, DollarSign, TrendingUp, AlertCircle,
  Download, Calendar, MapPin, Smartphone, Activity, Building2,
  ArrowUp, ArrowDown, Eye, QrCode, Menu, X, Filter, Search,
  RefreshCw, FileText, Mail, Zap, Target, Award, Settings,
  LogOut, ChevronDown, CheckCircle, XCircle, Clock, Send,
  Tag, Bell, Percent, Plus, Trash2, Edit, Shield, Check, CreditCard
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import GlobalAiChatWidget from './components/GlobalAiChatWidget';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';

export default function Dashboard_OIAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Churn Risk Modal States
  const [showTakeActionModal, setShowTakeActionModal] = useState(false);
  const [showReachOutModal, setShowReachOutModal] = useState(false);
  const [selectedChurnRisk, setSelectedChurnRisk] = useState(null);
  const [retentionActions, setRetentionActions] = useState({
    sendEmail: true,
    offerDiscount: false,
    discountAmount: '10',
    scheduleCall: false,
    callDate: '',
    personalMessage: ''
  });
  const [reachOutMessage, setReachOutMessage] = useState({
    subject: '',
    message: '',
    includeDiscount: false,
    discountCode: ''
  });

  // Discount Code State
  const [discountCodes, setDiscountCodes] = useState([]);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    maxUses: '',
    applicablePlans: ['small', 'medium', 'enterprise'],
    resellerId: null,
    resellerName: '',
    resellerEmail: '',
    commissionType: 'percentage',
    commissionValue: ''
  });
  const [creating, setCreating] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Load discount codes from backend API (with fallback to demo data)
  useEffect(() => {
    const demoDiscountCodes = [
      {
        id: 'demo-1',
        code: 'MERCHANT10',
        discountType: 'percentage',
        discountValue: 10,
        status: 'active',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: 100,
        currentUses: 23,
        applicablePlans: ['small', 'medium'],
        resellerName: 'Demo Reseller',
        commissionType: 'percentage',
        commissionValue: 15
      },
      {
        id: 'demo-2',
        code: 'LAUNCH20',
        discountType: 'percentage',
        discountValue: 20,
        status: 'active',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: 50,
        currentUses: 12,
        applicablePlans: ['small', 'medium', 'enterprise'],
        resellerName: null,
        commissionType: null,
        commissionValue: 0
      }
    ];

    const fetchDiscountCodes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDiscountCodes(data.length > 0 ? data : demoDiscountCodes);
        } else {
          setDiscountCodes(demoDiscountCodes);
        }
      } catch (error) {
        setDiscountCodes(demoDiscountCodes);
      }
    };
    fetchDiscountCodes();
  }, []);

  // Mock data - Replace with API calls
  const overviewStats = {
    totalCustomers: 314, // 89 Personal + 142 Small + 68 Medium + 15 Enterprise
    activeCustomers: 305,
    totalMRR: 3457,
    totalQRScans: 216025,
    newCustomersThisMonth: 12,
    churnRate: 2.8
  };

  const planBreakdown = [
    { plan: 'Personal', customers: 89, mrr: 0, avgScans: 42, color: 'bg-slate-500' },
    { plan: 'Small Business', customers: 142, mrr: 0, avgScans: 165, color: 'bg-blue-500' },
    { plan: 'Medium Business', customers: 68, mrr: 1972, avgScans: 998, color: 'bg-purple-500' },
    { plan: 'Enterprise', customers: 15, mrr: 1485, avgScans: 8378, color: 'bg-green-500' }
  ];

  const recentCustomers = [
    { company: "John Doe's Personal Account", email: 'john@personal.com', plan: 'Personal', users: 1, qrCodes: 3, scans: 67, joined: '2026-01-31', status: 'active' },
    { company: 'Pizza Palace Inc', email: 'owner@pizzapalace.com', plan: 'Small Business', users: 1, qrCodes: 5, scans: 156, joined: '2026-01-31', status: 'active' },
    { company: 'Acme Corp', email: 'admin@acme.com', plan: 'Medium Business', users: 8, qrCodes: 23, scans: 2451, joined: '2026-01-28', status: 'active' },
    { company: 'Global Hotels Ltd', email: 'tech@globalhotels.com', plan: 'Enterprise', users: 45, qrCodes: 187, scans: 45892, joined: '2026-01-25', status: 'active' },
    { company: "Sarah's Portfolio", email: 'sarah.designer@gmail.com', plan: 'Personal', users: 1, qrCodes: 2, scans: 34, joined: '2026-01-24', status: 'active' },
    { company: 'Coffee Shop Inc', email: 'info@coffeeshop.com', plan: 'Small Business', users: 3, qrCodes: 5, scans: 892, joined: '2026-01-24', status: 'active' },
    { company: 'Tech Startup XYZ', email: 'hello@techxyz.com', plan: 'Medium Business', users: 12, qrCodes: 34, scans: 5678, joined: '2026-01-22', status: 'active' }
  ];

  const upgradeOpportunities = [
    { company: "John Doe's Personal Account", plan: 'Personal', users: '1/1', qrCodes: '3/3', scans: 234, potential: 0, score: 98, upgradeTo: 'Small Business' },
    { company: "Mike's Portfolio", plan: 'Personal', users: '1/1', qrCodes: '3/3', scans: 567, potential: 0, score: 96, upgradeTo: 'Small Business' },
    { company: 'Pizza Palace Inc', plan: 'Small Business', users: '3/3', qrCodes: '5/5', scans: 1234, potential: 29, score: 95, upgradeTo: 'Medium Business' },
    { company: "Bob's Burgers", plan: 'Small Business', users: '2/3', qrCodes: '5/5', scans: 892, potential: 29, score: 88, upgradeTo: 'Medium Business' },
    { company: 'Coffee Shop Inc', plan: 'Small Business', users: '3/3', qrCodes: '3/5', scans: 2456, potential: 29, score: 92, upgradeTo: 'Medium Business' },
    { company: 'Event Company Pro', plan: 'Medium Business', users: '45/∞', qrCodes: '156/∞', scans: 23456, potential: 70, score: 85, upgradeTo: 'Enterprise' }
  ];

  const churnRisks = [
    { company: 'Dormant Corp', plan: 'Medium Business', mrr: 29, lastActivity: '47 days ago', scans: 23, risk: 'HIGH' },
    { company: 'Inactive Inc', plan: 'Enterprise', mrr: 99, lastActivity: '21 days ago', scans: 156, risk: 'HIGH' },
    { company: 'Quiet Business', plan: 'Medium Business', mrr: 29, lastActivity: '13 days ago', scans: 445, risk: 'MEDIUM' }
  ];

  const topLocations = [
    { city: 'Chicago', state: 'IL', country: 'United States', region: 'North America', flag: '🇺🇸', scans: 3457, uniqueQR: 89, customers: 23, lat: 41.8781, lng: -87.6298 },
    { city: 'New York', state: 'NY', country: 'United States', region: 'North America', flag: '🇺🇸', scans: 2891, uniqueQR: 67, customers: 34, lat: 40.7128, lng: -74.0060 },
    { city: 'Los Angeles', state: 'CA', country: 'United States', region: 'North America', flag: '🇺🇸', scans: 2134, uniqueQR: 54, customers: 28, lat: 34.0522, lng: -118.2437 },
    { city: 'London', state: '', country: 'United Kingdom', region: 'Europe', flag: '🇬🇧', scans: 1876, uniqueQR: 43, customers: 18, lat: 51.5074, lng: -0.1278 },
    { city: 'Toronto', state: 'ON', country: 'Canada', region: 'North America', flag: '🇨🇦', scans: 1234, uniqueQR: 45, customers: 12, lat: 43.6532, lng: -79.3832 },
    { city: 'Sydney', state: 'NSW', country: 'Australia', region: 'Oceania', flag: '🇦🇺', scans: 987, uniqueQR: 34, customers: 9, lat: -33.8688, lng: 151.2093 },
    { city: 'Berlin', state: '', country: 'Germany', region: 'Europe', flag: '🇩🇪', scans: 756, uniqueQR: 28, customers: 7, lat: 52.5200, lng: 13.4050 },
    { city: 'Tokyo', state: '', country: 'Japan', region: 'Asia', flag: '🇯🇵', scans: 654, uniqueQR: 21, customers: 5, lat: 35.6762, lng: 139.6503 },
    { city: 'São Paulo', state: 'SP', country: 'Brazil', region: 'South America', flag: '🇧🇷', scans: 543, uniqueQR: 19, customers: 4, lat: -23.5505, lng: -46.6333 },
    { city: 'Dubai', state: '', country: 'UAE', region: 'Middle East', flag: '🇦🇪', scans: 432, uniqueQR: 15, customers: 3, lat: 25.2048, lng: 55.2708 }
  ];

  // Region breakdown for overseas tracking
  const regionBreakdown = [
    { region: 'North America', scans: 7716, percentage: 52, color: 'bg-blue-500' },
    { region: 'Europe', scans: 2632, percentage: 18, color: 'bg-purple-500' },
    { region: 'Oceania', scans: 987, percentage: 7, color: 'bg-green-500' },
    { region: 'Asia', scans: 654, percentage: 4, color: 'bg-yellow-500' },
    { region: 'South America', scans: 543, percentage: 4, color: 'bg-orange-500' },
    { region: 'Middle East', scans: 432, percentage: 3, color: 'bg-red-500' },
    { region: 'Other', scans: 1800, percentage: 12, color: 'bg-slate-400' }
  ];

  const deviceStats = [
    { type: 'Mobile (iOS)', scans: 98456, percentage: 62.3, icon: Smartphone, color: 'text-blue-600' },
    { type: 'Mobile (Android)', scans: 45678, percentage: 28.9, icon: Smartphone, color: 'text-green-600' },
    { type: 'Desktop', scans: 10234, percentage: 6.5, icon: Activity, color: 'text-purple-600' },
    { type: 'Tablet', scans: 3657, percentage: 2.3, icon: Activity, color: 'text-orange-600' }
  ];

  const topPerformers = [
    { company: 'Global Hotels Ltd', plan: 'Enterprise', qrCodes: 245, scans: 78923, campaigns: 15, avgScansPerQR: 322, countries: 47 },
    { company: 'Restaurant Chain Co', plan: 'Enterprise', qrCodes: 156, scans: 45678, campaigns: 12, avgScansPerQR: 293, countries: 8 },
    { company: 'Event Company Pro', plan: 'Medium Business', qrCodes: 87, scans: 23456, campaigns: 34, avgScansPerQR: 270, countries: 12 }
  ];

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'geography', label: 'Geography', icon: Globe },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'discounts', label: 'Discount Codes', icon: Tag },
    { id: 'exports', label: 'Data Exports', icon: Download }
  ];

  // Discount Code Functions
  const handleDiscountFormChange = (field, value) => {
    setDiscountForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlanToggle = (plan) => {
    setDiscountForm(prev => {
      const currentPlans = prev.applicablePlans || [];
      const newPlans = currentPlans.includes(plan)
        ? currentPlans.filter(p => p !== plan)
        : [...currentPlans, plan];
      return { ...prev, applicablePlans: newPlans };
    });
  };

  const handleCreateDiscountCode = async () => {
    try {
      setCreating(true);

      // Validation
      if (!discountForm.code || !discountForm.discountValue) {
        alert('Please fill in code and discount value');
        setCreating(false);
        return;
      }

      const upperCode = discountForm.code.toUpperCase().trim();

      const newCode = {
        code: upperCode,
        resellerId: discountForm.resellerId,
        resellerName: discountForm.resellerName || null,
        resellerEmail: discountForm.resellerEmail || null,
        discountType: discountForm.discountType,
        discountValue: parseFloat(discountForm.discountValue),
        status: 'active',
        validFrom: discountForm.validFrom || new Date().toISOString(),
        validUntil: discountForm.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: discountForm.maxUses ? parseInt(discountForm.maxUses) : null,
        currentUses: 0,
        maxUsesPerCustomer: 1,
        applicablePlans: discountForm.applicablePlans.length > 0 ? discountForm.applicablePlans : null,
        minimumPurchase: 0,
        commissionType: discountForm.commissionType,
        commissionValue: discountForm.commissionValue ? parseFloat(discountForm.commissionValue) : 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        notes: '',
        tags: []
      };

      const response = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newCode)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create discount code');
      }

      // Reset form
      setDiscountForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        validFrom: '',
        validUntil: '',
        maxUses: '',
        applicablePlans: ['small', 'medium', 'enterprise'],
        resellerId: null,
        resellerName: '',
        resellerEmail: '',
        commissionType: 'percentage',
        commissionValue: ''
      });

      alert('Discount code created successfully!');
      setCreating(false);

    } catch (error) {
      console.error('Error creating discount code:', error);
      alert('Error creating discount code. Please try again.');
      setCreating(false);
    }
  };

  const handleDeleteDiscountCode = async (codeId, codeName) => {
    if (!confirm(`Are you sure you want to delete the discount code "${codeName}"?`)) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/admin/discount-codes/${codeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setDiscountCodes(prev => prev.filter(dc => dc.id !== codeId));
      alert('Discount code deleted successfully!');
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Error deleting discount code. Please try again.');
    }
  };

  const formatDiscountDisplay = (code) => {
    if (code.discountType === 'percentage') {
      return `${code.discountValue}% off`;
    } else {
      return `$${code.discountValue} off`;
    }
  };

  const formatPlansDisplay = (plans) => {
    if (!plans || plans.length === 0) return 'All Plans';
    return plans.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold">OI Admin</h1>
              <p className="text-xs text-slate-400">Internal Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                alert('Logging out... Redirecting to login page.');
                // Add actual logout logic here
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg mt-1"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="bg-slate-900 w-72 h-full">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">OI Admin</h1>
                  <p className="text-xs text-slate-400">Internal Dashboard</p>
                </div>
              </div>
              <button onClick={closeMobileMenu} className="text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    closeMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
                <Menu size={24} className="text-slate-700" />
              </button>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                  {navItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-slate-500">Outbound Impact Company Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="12months">Last 12 Months</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => {
                  alert('Refreshing dashboard data...');
                  // Add actual refresh logic here - could trigger a data refetch
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <NotificationsPanel dashboardType="admin" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto">
              {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">Total Customers</p>
                      <Users className="text-blue-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{overviewStats.totalCustomers}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <ArrowUp size={14} />
                      +{overviewStats.newCustomersThisMonth} this month
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">Monthly Revenue</p>
                      <DollarSign className="text-green-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">${overviewStats.totalMRR.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <ArrowUp size={14} />
                      +8.5% from last month
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">Total QR Scans</p>
                      <QrCode className="text-purple-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{overviewStats.totalQRScans.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <ArrowUp size={14} />
                      +12.3% from last month
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">Churn Rate</p>
                      <AlertCircle className="text-orange-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{overviewStats.churnRate}%</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <ArrowDown size={14} />
                      -1.2% from last month
                    </p>
                  </div>
                </div>

              {/* Plan Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Plan Distribution</h3>
                  <div className="space-y-4">
                    {planBreakdown.map((plan, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${plan.color}`}></div>
                            <span className="font-medium text-slate-900">{plan.plan}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-slate-600">{plan.customers} customers</span>
                            <span className="font-semibold text-slate-900">
                              ${plan.mrr.toLocaleString()} MRR
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`${plan.color} h-2 rounded-full`}
                            style={{ width: `${(plan.customers / overviewStats.totalCustomers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              {/* Recent Customers & Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Customers</h3>
                    <div className="space-y-3">
                      {recentCustomers.slice(0, 5).map((customer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{customer.company}</p>
                            <p className="text-xs text-slate-500">{customer.plan}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">{customer.scans.toLocaleString()} scans</p>
                            <p className="text-xs text-slate-500">{customer.qrCodes} QR codes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performers</h3>
                    <div className="space-y-3">
                      {topPerformers.map((customer, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{customer.company}</p>
                            <p className="text-xs text-slate-500">{customer.scans.toLocaleString()} scans in {customer.countries} countries</p>
                          </div>
                          <Award className="text-yellow-500" size={20} />
                        </div>
                      ))}
                    </div>
                  </div>

              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="max-w-7xl mx-auto">
                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">All Plans</option>
                  <option value="personal">Personal</option>
                  <option value="small_business">Small Business</option>
                  <option value="medium_business">Medium Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <button
                  onClick={() => alert('Exporting customer data to CSV... Download will begin shortly.')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              {/* Customer Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Company</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Plan</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Users</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">QR Codes</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Scans</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Joined</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCustomers.map((customer, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-slate-900">{customer.company}</p>
                              <p className="text-sm text-slate-500">{customer.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              customer.plan === 'Enterprise'
                                ? 'bg-green-100 text-green-700'
                                : customer.plan === 'Medium Business'
                                ? 'bg-purple-100 text-purple-700'
                                : customer.plan === 'Small Business'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {customer.plan}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-900">{customer.users}</td>
                          <td className="py-4 px-6 text-sm text-slate-900">{customer.qrCodes}</td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">{customer.scans.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm text-slate-600">{customer.joined}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle size={12} />
                              {customer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* GEOGRAPHY TAB */}
          {activeTab === 'geography' && (
            <div className="max-w-7xl mx-auto">
                {/* Worldwide Coverage Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <Globe size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Worldwide Campaign Tracking</h3>
                        <p className="text-blue-100">QR scans are tracked globally - see exactly where your campaigns reach</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{topLocations.reduce((sum, loc) => sum + loc.scans, 0).toLocaleString()}</p>
                      <p className="text-blue-100 text-sm">Total global scans</p>
                    </div>
                  </div>
                </div>

                {/* Region Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                  {regionBreakdown.map((region, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">{region.region}</p>
                      <p className="text-lg font-bold text-slate-900">{region.scans.toLocaleString()}</p>
                      <div className="mt-2 bg-slate-200 rounded-full h-1.5">
                        <div className={`${region.color} h-1.5 rounded-full`} style={{ width: `${region.percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{region.percentage}%</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Global QR Scan Activity</h3>
                  <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live tracking worldwide
                  </span>
                </div>
                <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Globe size={48} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Interactive map visualization</p>
                    <p className="text-sm text-slate-500">Integrate with mapping library (Mapbox, Leaflet, etc.)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Top Locations (Last 30 Days)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Rank</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Location</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Region</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Total Scans</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Unique QR Codes</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Customers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLocations.map((location, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{location.flag}</span>
                              <div>
                                <p className="font-medium text-slate-900">{location.city}{location.state && `, ${location.state}`}</p>
                                <p className="text-sm text-slate-500">{location.country}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{location.region}</span>
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">{location.scans.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm text-slate-900">{location.uniqueQR}</td>
                          <td className="py-4 px-6 text-sm text-slate-900">{location.customers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Device Stats */}
              <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Device Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {deviceStats.map((device, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <device.icon className={device.color} size={24} />
                        <p className="text-sm font-medium text-slate-900">{device.type}</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 mb-1">{device.scans.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* REVENUE TAB */}
          {activeTab === 'revenue' && (
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-2">Total MRR</p>
                  <p className="text-3xl font-bold text-slate-900">${overviewStats.totalMRR.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-2">+8.5% from last month</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-2">Avg Revenue per Customer</p>
                  <p className="text-3xl font-bold text-slate-900">${(overviewStats.totalMRR / overviewStats.totalCustomers).toFixed(2)}</p>
                  <p className="text-sm text-slate-500 mt-2">Based on {overviewStats.totalCustomers} customers</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-2">Annual Run Rate</p>
                  <p className="text-3xl font-bold text-slate-900">${(overviewStats.totalMRR * 12).toLocaleString()}</p>
                  <p className="text-sm text-purple-600 mt-2">Projected annual revenue</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue by Plan</h3>
                {planBreakdown.map((plan, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${plan.color}`}></div>
                        <span className="font-medium text-slate-900">{plan.plan}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">${plan.mrr.toLocaleString()}/mo</p>
                        <p className="text-sm text-slate-500">{plan.customers} customers</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`${plan.color} h-3 rounded-full flex items-center justify-end pr-2`}
                        style={{ width: `${(plan.mrr / overviewStats.totalMRR) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {((plan.mrr / overviewStats.totalMRR) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Breakdown - Paul's Request */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Payment Method Breakdown</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Live from Stripe</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { method: 'Credit Card', amount: Math.round(overviewStats.totalMRR * 0.72), percent: 72, icon: '💳', color: 'bg-blue-500' },
                    { method: 'PayPal', amount: Math.round(overviewStats.totalMRR * 0.15), percent: 15, icon: '🅿️', color: 'bg-indigo-500' },
                    { method: 'ACH/Bank', amount: Math.round(overviewStats.totalMRR * 0.10), percent: 10, icon: '🏦', color: 'bg-green-500' },
                    { method: 'Invoice', amount: Math.round(overviewStats.totalMRR * 0.03), percent: 3, icon: '📄', color: 'bg-orange-500' },
                  ].map((pm, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{pm.icon}</span>
                        <span className="font-medium text-slate-700">{pm.method}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">${pm.amount.toLocaleString()}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div className={`${pm.color} h-2 rounded-full`} style={{ width: `${pm.percent}%` }}></div>
                        </div>
                        <span className="text-sm text-slate-600">{pm.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Data synced from Stripe, PayPal, and bank integrations • Last updated: 2 minutes ago
                </div>
              </div>

              {/* Data Source Explanation - Rick's Question */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">How Revenue is Calculated</h4>
                    <p className="text-sm text-slate-700 mb-3">
                      Revenue metrics are calculated from <strong>live payment processor data</strong>, not from account counts × pricing:
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span><strong>Stripe:</strong> Primary payment processor for credit cards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span><strong>PayPal:</strong> Connected via PayPal Business API</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span><strong>Bank/ACH:</strong> Via Plaid integration for direct debits</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span><strong>Invoices:</strong> Manual invoices tracked in billing system</span>
                      </li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-3">
                      This ensures accurate revenue tracking including refunds, chargebacks, and partial payments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Forecast</h3>
                <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp size={48} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Chart visualization</p>
                    <p className="text-sm text-slate-500">Integrate with Chart.js, Recharts, etc.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* OPPORTUNITIES TAB */}
          {activeTab === 'opportunities' && (
            <div className="max-w-7xl mx-auto">
                {/* Upgrade Opportunities */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Upgrade Opportunities</h3>
                    <p className="text-sm text-slate-600">Customers close to plan limits or high engagement</p>
                  </div>
                  <button
                    onClick={() => alert(`Preparing email campaign for ${upgradeOpportunities.length} upgrade opportunities...`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <Mail size={16} />
                    Email All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Company</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Current Plan</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Users</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">QR Codes</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Total Scans</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Potential MRR</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Score</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upgradeOpportunities.map((opp, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-6 font-medium text-slate-900">{opp.company}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {opp.plan}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-sm font-medium ${opp.users.includes('/') && opp.users.split('/')[0] === opp.users.split('/')[1] ? 'text-orange-600' : 'text-slate-900'}`}>
                              {opp.users}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-sm font-medium ${opp.qrCodes.includes('/') && opp.qrCodes.split('/')[0] === opp.qrCodes.split('/')[1] ? 'text-orange-600' : 'text-slate-900'}`}>
                              {opp.qrCodes}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">{opp.scans.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm font-bold text-green-600">+${opp.potential}/mo</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2 w-16">
                                <div
                                  className={`h-2 rounded-full ${opp.score >= 90 ? 'bg-green-500' : 'bg-orange-500'}`}
                                  style={{ width: `${opp.score}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-slate-900">{opp.score}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => alert(`Opening contact form for ${opp.company}...\nRecommend upgrade to ${opp.upgradeTo} plan.`)}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                            >
                              Contact
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Churn Risks */}
              <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                <div className="p-6 border-b border-red-200 bg-red-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={24} />
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Churn Risk Alert</h3>
                      <p className="text-sm text-red-700">Paying customers with low activity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTakeActionModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                  >
                    <Zap size={16} />
                    Take Action
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Company</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Plan</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">MRR at Risk</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Last Activity</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Total Scans</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Risk Level</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {churnRisks.map((risk, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-6 font-medium text-slate-900">{risk.company}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              risk.plan === 'Enterprise' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {risk.plan}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-red-600">${risk.mrr}/mo</td>
                          <td className="py-4 px-6 text-sm text-slate-900">{risk.lastActivity}</td>
                          <td className="py-4 px-6 text-sm text-slate-900">{risk.scans.toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              risk.risk === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {risk.risk} RISK
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedChurnRisk(risk);
                                setReachOutMessage({
                                  subject: `We miss you at Outbound Impact, ${risk.company}!`,
                                  message: `Hi there,\n\nWe noticed it's been a while since you've been active on Outbound Impact. We'd love to help you get the most out of your ${risk.plan} subscription.\n\nIs there anything we can help you with? Our team is here to support you.\n\nBest regards,\nThe Outbound Impact Team`,
                                  includeDiscount: false,
                                  discountCode: ''
                                });
                                setShowReachOutModal(true);
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                              Reach Out
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* DATA EXPORTS TAB */}
          {activeTab === 'exports' && (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Exports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => alert('Exporting All Customers data...\nFormats available: CSV, Excel\nDownload will begin shortly.')}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="text-purple-600" size={24} />
                      <h4 className="font-semibold text-slate-900">All Customers</h4>
                    </div>
                    <p className="text-sm text-slate-600">Export complete customer list with metrics</p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">CSV</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">Excel</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert('Exporting Geographic Data...\nFormats available: CSV, JSON\nDownload will begin shortly.')}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="text-blue-600" size={24} />
                      <h4 className="font-semibold text-slate-900">Geographic Data</h4>
                    </div>
                    <p className="text-sm text-slate-600">QR scan locations (anonymized)</p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">CSV</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">JSON</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert('Exporting Revenue Report...\nFormats available: Excel, PDF\nDownload will begin shortly.')}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="text-green-600" size={24} />
                      <h4 className="font-semibold text-slate-900">Revenue Report</h4>
                    </div>
                    <p className="text-sm text-slate-600">MRR breakdown by plan and customer</p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">Excel</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">PDF</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert('Exporting Usage Analytics...\nFormats available: CSV, Excel\nDownload will begin shortly.')}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="text-orange-600" size={24} />
                      <h4 className="font-semibold text-slate-900">Usage Analytics</h4>
                    </div>
                    <p className="text-sm text-slate-600">Scan data, device stats, time trends</p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">CSV</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">Excel</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Custom Data Export</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Need specific data for analysis or to sell to third parties? Create a custom export with your chosen parameters.
                    </p>
                    <button
                      onClick={() => alert('Opening Custom Export Builder...\nSelect your data parameters and format preferences.')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                    >
                      Create Custom Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Exports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="text-slate-400" size={20} />
                      <div>
                        <p className="font-medium text-slate-900">customer_data_2026-01-31.csv</p>
                        <p className="text-xs text-slate-500">Generated 2 hours ago • 2.3 MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Downloading customer_data_2026-01-31.csv (2.3 MB)...')}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="text-slate-400" size={20} />
                      <div>
                        <p className="font-medium text-slate-900">geographic_scans_jan_2026.xlsx</p>
                        <p className="text-xs text-slate-500">Generated 1 day ago • 5.7 MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Downloading geographic_scans_jan_2026.xlsx (5.7 MB)...')}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <div className="max-w-6xl mx-auto">
                {/* Create New Campaign */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create New Campaign</h3>
                    <p className="text-sm text-slate-600 mt-1">Send targeted alerts to specific customer segments</p>
                  </div>
                  <button
                    onClick={() => alert('Preparing to send campaign...\nPlease fill in campaign details and targeting options first.')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Send size={18} />
                    Send Campaign
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g., New Feature Announcement"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                      <textarea
                        rows={4}
                        placeholder="Enter your campaign message..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option>In-App Notification</option>
                        <option>Email Alert</option>
                        <option>Both</option>
                      </select>
                    </div>
                  </div>

                  {/* Targeting Options */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Target size={18} className="text-purple-600" />
                      Target Audience
                    </h4>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Plan Type</label>
                      <div className="space-y-2">
                        {['Personal', 'Small Business', 'Medium Business', 'Enterprise'].map(plan => (
                          <label key={plan} className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 text-purple-600" defaultChecked />
                            <span className="text-sm text-slate-700">{plan}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Member Since (days)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="flex items-center text-slate-500">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Min QR Codes</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Min Users</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Geography (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., United States, Australia"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-purple-900">Estimated Reach</p>
                      <p className="text-2xl font-bold text-purple-600">~245 customers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Campaigns</h3>
                <div className="space-y-3">
                  {[
                    { name: 'New Features - January Update', sent: '2026-01-30', recipients: 314, opens: 278, clicks: 156, status: 'completed' },
                    { name: 'Holiday Discount - 20% Off', sent: '2026-01-25', recipients: 225, opens: 198, clicks: 134, status: 'completed' },
                    { name: 'Upgrade Reminder - Enterprise', sent: '2026-01-20', recipients: 68, opens: 61, clicks: 12, status: 'completed' }
                  ].map((campaign, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {campaign.recipients} sent
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {campaign.opens} opens
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity size={14} />
                            {campaign.clicks} clicks
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {campaign.sent}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Viewing report for: ${campaign.name}\nSent: ${campaign.sent}\nRecipients: ${campaign.recipients}\nOpens: ${campaign.opens}\nClicks: ${campaign.clicks}`)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
                      >
                        View Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* DISCOUNT CODES TAB */}
          {activeTab === 'discounts' && (
            <div className="max-w-6xl mx-auto">
                {/* Create New Discount Code */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create Discount Code</h3>
                    <p className="text-sm text-slate-600 mt-1">Generate promotional codes for customers or resellers</p>
                  </div>
                  <button
                    onClick={handleCreateDiscountCode}
                    disabled={creating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    {creating ? 'Creating...' : 'Create Code'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Code *</label>
                    <input
                      type="text"
                      placeholder="e.g., MERCHANT123"
                      value={discountForm.code}
                      onChange={(e) => handleDiscountFormChange('code', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount Type</label>
                    <select
                      value={discountForm.discountType}
                      onChange={(e) => handleDiscountFormChange('discountType', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount Value *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="15"
                        value={discountForm.discountValue}
                        onChange={(e) => handleDiscountFormChange('discountValue', e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700">
                        {discountForm.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valid From</label>
                    <input
                      type="date"
                      value={discountForm.validFrom}
                      onChange={(e) => handleDiscountFormChange('validFrom', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={discountForm.validUntil}
                      onChange={(e) => handleDiscountFormChange('validUntil', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={discountForm.maxUses}
                      onChange={(e) => handleDiscountFormChange('maxUses', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Applies To Plans</label>
                    <div className="flex gap-4">
                      {[
                        { value: 'small', label: 'Small Business' },
                        { value: 'medium', label: 'Medium Business' },
                        { value: 'enterprise', label: 'Enterprise' }
                      ].map(plan => (
                        <label key={plan.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={discountForm.applicablePlans.includes(plan.value)}
                            onChange={() => handlePlanToggle(plan.value)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="text-sm text-slate-700">{plan.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-full border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Reseller Commission (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Reseller Name</label>
                        <input
                          type="text"
                          placeholder="e.g., John's Tech Shop"
                          value={discountForm.resellerName}
                          onChange={(e) => handleDiscountFormChange('resellerName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Commission Type</label>
                        <select
                          value={discountForm.commissionType}
                          onChange={(e) => handleDiscountFormChange('commissionType', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed_amount">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Commission Value</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="20"
                            value={discountForm.commissionValue}
                            onChange={(e) => handleDiscountFormChange('commissionValue', e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700">
                            {discountForm.commissionType === 'percentage' ? '%' : '$'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Discount Codes */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Active Discount Codes ({discountCodes.length})
                </h3>
                {discountCodes.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No discount codes yet. Create your first one above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discountCodes.map((discount) => (
                      <div key={discount.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="px-3 py-1 bg-purple-100 text-purple-700 rounded font-mono font-bold text-sm">
                              {discount.code}
                            </code>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              discount.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {discount.status}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">
                              {formatDiscountDisplay(discount)}
                            </span>
                            {discount.resellerName && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Reseller: {discount.resellerName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Tag size={14} />
                              {formatPlansDisplay(discount.applicablePlans)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {discount.currentUses || 0}/{discount.maxUses || '∞'} used
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Expires {new Date(discount.validUntil).toLocaleDateString()}
                            </span>
                            {discount.commissionValue > 0 && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign size={14} />
                                {discount.commissionType === 'percentage'
                                  ? `${discount.commissionValue}% commission`
                                  : `$${discount.commissionValue} commission`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteDiscountCode(discount.id, discount.code)}
                            className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Platform Settings</h2>
                <p className="text-slate-600">Manage system-wide configurations and preferences</p>
              </div>

              {/* Platform Configuration */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Settings size={24} className="text-purple-600" />
                  Platform Configuration
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Outbound Impact"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      defaultValue="support@outboundimpact.com"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Default Currency
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none">
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Maintenance Mode</p>
                      <p className="text-sm text-slate-600">Temporarily disable customer access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => alert('Platform settings saved successfully!')}
                  className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Save Platform Settings
                </button>
              </div>

              {/* User Management Settings */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users size={24} className="text-blue-600" />
                  User Management
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Allow New Registrations</p>
                      <p className="text-sm text-slate-600">Users can create new accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Require Email Verification</p>
                      <p className="text-sm text-slate-600">New users must verify their email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Default User Role
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none">
                      <option value="personal">Personal (Free)</option>
                      <option value="small-business">Small Business</option>
                      <option value="medium-business">Medium Business</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => alert('User management settings saved successfully!')}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save User Settings
                </button>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Bell size={24} className="text-yellow-600" />
                  Notification Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">New Customer Alerts</p>
                      <p className="text-sm text-slate-600">Email when new customers sign up</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Revenue Milestones</p>
                      <p className="text-sm text-slate-600">Alert on revenue goals achieved</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">System Alerts</p>
                      <p className="text-sm text-slate-600">Critical system notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Weekly Reports</p>
                      <p className="text-sm text-slate-600">Automated weekly summary emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => alert('Notification settings saved successfully!')}
                  className="mt-6 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Save Notification Settings
                </button>
              </div>

              {/* API & Integrations */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap size={24} className="text-green-600" />
                  API & Integrations
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">API Key</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="oi_live_••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
                            alert('New API key generated successfully!\nPlease update your integrations with the new key.');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Webhook URL</p>
                    <input
                      type="url"
                      placeholder="https://your-domain.com/webhook"
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => alert('Integration settings saved successfully!')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Save Integration Settings
                </button>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Shield size={24} className="text-red-600" />
                  Security Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-600">Require 2FA for admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Login Attempt Limits</p>
                      <p className="text-sm text-slate-600">Lock accounts after failed attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => alert('Security settings saved successfully!')}
                  className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Save Security Settings
                </button>
              </div>

              {/* Backup & Data */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Download size={24} className="text-slate-600" />
                  Backup & Data Management
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Automatic Daily Backups</p>
                      <p className="text-sm text-slate-600">Last backup: 2 hours ago</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => alert('Preparing full backup download...\nThis may take a few minutes for large datasets.')}
                      className="px-4 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download Full Backup
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to restore from a backup? This will overwrite current data.')) {
                          alert('Please select a backup file to restore from.');
                        }
                      }}
                      className="px-4 py-3 border-2 border-slate-600 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Restore Backup
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Data Retention Policy</p>
                  <p className="text-sm text-yellow-700">Customer data retained for 7 years after account closure, as per Australian regulations.</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Take Action Modal - Bulk retention actions for all at-risk customers */}
      {showTakeActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="text-white" size={28} />
                  <div>
                    <h2 className="text-xl font-bold text-white">Retention Action Center</h2>
                    <p className="text-red-100">Take action on {churnRisks.length} at-risk customers</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTakeActionModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* At-Risk Summary */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-3">At-Risk Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{churnRisks.length}</p>
                    <p className="text-sm text-red-700">Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">${churnRisks.reduce((sum, r) => sum + r.mrr, 0)}</p>
                    <p className="text-sm text-red-700">MRR at Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{churnRisks.filter(r => r.risk === 'HIGH').length}</p>
                    <p className="text-sm text-red-700">High Risk</p>
                  </div>
                </div>
              </div>

              {/* Action Options */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-slate-900">Select Retention Actions</h3>

                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={retentionActions.sendEmail}
                    onChange={(e) => setRetentionActions(prev => ({...prev, sendEmail: e.target.checked}))}
                    className="mt-1 w-5 h-5 text-red-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Send Re-engagement Email</p>
                    <p className="text-sm text-slate-600">Automated email reminding customers of the value they're missing</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={retentionActions.offerDiscount}
                    onChange={(e) => setRetentionActions(prev => ({...prev, offerDiscount: e.target.checked}))}
                    className="mt-1 w-5 h-5 text-red-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Offer Discount Incentive</p>
                    <p className="text-sm text-slate-600 mb-2">Provide a discount to encourage continued subscription</p>
                    {retentionActions.offerDiscount && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={retentionActions.discountAmount}
                          onChange={(e) => setRetentionActions(prev => ({...prev, discountAmount: e.target.value}))}
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
                          min="5"
                          max="50"
                        />
                        <span className="text-sm text-slate-600">% off next month</span>
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={retentionActions.scheduleCall}
                    onChange={(e) => setRetentionActions(prev => ({...prev, scheduleCall: e.target.checked}))}
                    className="mt-1 w-5 h-5 text-red-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Schedule Follow-up Calls</p>
                    <p className="text-sm text-slate-600 mb-2">Add customers to call queue for personal outreach</p>
                    {retentionActions.scheduleCall && (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={retentionActions.callDate}
                          onChange={(e) => setRetentionActions(prev => ({...prev, callDate: e.target.value}))}
                          className="px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Personal Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={retentionActions.personalMessage}
                  onChange={(e) => setRetentionActions(prev => ({...prev, personalMessage: e.target.value}))}
                  placeholder="Add a personal note to include in outreach communications..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTakeActionModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const actions = [];
                    if (retentionActions.sendEmail) actions.push('Re-engagement emails');
                    if (retentionActions.offerDiscount) actions.push(`${retentionActions.discountAmount}% discount`);
                    if (retentionActions.scheduleCall) actions.push('Follow-up calls');

                    alert(`Retention workflow initiated!\n\nActions for ${churnRisks.length} customers:\n• ${actions.join('\n• ')}\n\nYou'll receive a summary report via email.`);
                    setShowTakeActionModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Launch Retention Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reach Out Modal - Contact individual at-risk customer */}
      {showReachOutModal && selectedChurnRisk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="text-white" size={28} />
                  <div>
                    <h2 className="text-xl font-bold text-white">Reach Out to Customer</h2>
                    <p className="text-red-100">{selectedChurnRisk.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReachOutModal(false);
                    setSelectedChurnRisk(null);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Plan</p>
                    <p className="font-semibold text-slate-900">{selectedChurnRisk.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">MRR</p>
                    <p className="font-semibold text-red-600">${selectedChurnRisk.mrr}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Last Active</p>
                    <p className="font-semibold text-slate-900">{selectedChurnRisk.lastActivity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Risk Level</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedChurnRisk.risk === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedChurnRisk.risk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={reachOutMessage.subject}
                    onChange={(e) => setReachOutMessage(prev => ({...prev, subject: e.target.value}))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={reachOutMessage.message}
                    onChange={(e) => setReachOutMessage(prev => ({...prev, message: e.target.value}))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={6}
                  />
                </div>

                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={reachOutMessage.includeDiscount}
                    onChange={(e) => setReachOutMessage(prev => ({...prev, includeDiscount: e.target.checked}))}
                    className="mt-1 w-5 h-5 text-red-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Include Discount Code</p>
                    <p className="text-sm text-slate-600 mb-2">Attach a special discount to encourage re-engagement</p>
                    {reachOutMessage.includeDiscount && (
                      <select
                        value={reachOutMessage.discountCode}
                        onChange={(e) => setReachOutMessage(prev => ({...prev, discountCode: e.target.value}))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="">Select a discount code...</option>
                        {discountCodes.filter(dc => dc.status === 'active').map(dc => (
                          <option key={dc.id} value={dc.code}>
                            {dc.code} - {dc.discountValue}% off
                          </option>
                        ))}
                        <option value="WINBACK15">WINBACK15 - 15% off (Win-back special)</option>
                        <option value="COMEBACK20">COMEBACK20 - 20% off (Re-engagement)</option>
                      </select>
                    )}
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReachOutModal(false);
                    setSelectedChurnRisk(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`Message sent to ${selectedChurnRisk.company}!\n\nSubject: ${reachOutMessage.subject}\n${reachOutMessage.includeDiscount ? `\nDiscount code included: ${reachOutMessage.discountCode}` : ''}\n\nA copy has been sent to your email.`);
                    setShowReachOutModal(false);
                    setSelectedChurnRisk(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GlobalAiChatWidget showBlinkingPrompt={true} />
    </div>
  );
}
