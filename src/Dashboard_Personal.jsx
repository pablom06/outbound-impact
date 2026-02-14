// PERSONAL DASHBOARD
// Individual user dashboard with uploads, views, QR codes, and storage tracking
// Based on: https://github.com/shakeelahmed45/outbound-impact

import React, { useState, useEffect } from 'react';
import {
  Upload, Eye, QrCode, HardDrive, Plus, ChevronRight, ArrowUp,
  Home, Settings, LogOut, Menu, X, BarChart3, FolderOpen, User,
  Sparkles, Play, FileText, Image, Music, Video, ExternalLink
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import GlobalAiChatWidget from './components/GlobalAiChatWidget';
import UploadModal from './components/UploadModal';
import { dashboardAPI, itemsAPI } from './services/api';

export default function Dashboard_Personal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null); // holds item for QR display
  const [stats, setStats] = useState({
    uploads: 0,
    views: 0,
    qrCodes: 0,
    storageUsed: 0,
    storageLimit: 1073741824, // 1GB default for personal
  });
  const [recentItems, setRecentItems] = useState([]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Download QR code as image
  const handleDownloadQR = async (qrData, filename) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  // Mock user data (replace with real auth)
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Personal (Free)',
    avatar: 'J'
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Try to fetch from API, fall back to demo data
        try {
          const data = await dashboardAPI.getStats();
          setStats({
            uploads: data.uploads || 0,
            views: data.views || 0,
            qrCodes: data.qrCodes || 0,
            storageUsed: data.storageUsed || 0,
            storageLimit: data.storageLimit || 1073741824,
          });
        } catch (apiError) {
          // Use demo data if API not connected
          console.log('Using demo mode - API not available');
          setStats({
            uploads: 1,  // Keep low so upload button isn't disabled
            views: 127,
            qrCodes: 1,
            storageUsed: 52428800, // 50MB
            storageLimit: 1073741824, // 1GB
          });
        }

        // Try to fetch recent items
        try {
          const items = await itemsAPI.getAll();
          setRecentItems(items.slice(0, 5));
        } catch (itemsError) {
          // Demo items
          setRecentItems([
            { id: 1, title: 'Portfolio Video', type: 'video', views: 45, createdAt: '2026-01-28' },
            { id: 2, title: 'Resume PDF', type: 'pdf', views: 32, createdAt: '2026-01-25' },
            { id: 3, title: 'Project Photos', type: 'image', views: 50, createdAt: '2026-01-20' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage percentage
  const storagePercentage = Math.round((stats.storageUsed / stats.storageLimit) * 100);

  // Get icon for file type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'audio': return Music;
      case 'pdf':
      case 'document': return FileText;
      default: return FileText;
    }
  };

  // Navigation items for personal dashboard
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'items', label: 'My Items', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Stat cards data
  const statCards = [
    {
      label: 'Uploads',
      value: stats.uploads,
      max: 3,
      icon: Upload,
      color: 'bg-blue-500',
      description: `${stats.uploads}/3 items`,
    },
    {
      label: 'Total Views',
      value: stats.views,
      icon: Eye,
      color: 'bg-green-500',
      change: '+12%',
    },
    {
      label: 'QR Codes',
      value: stats.qrCodes,
      max: 3,
      icon: QrCode,
      color: 'bg-purple-500',
      description: `${stats.qrCodes}/3 codes`,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
              {user.avatar}
            </div>
            <div>
              <h1 className="text-sm font-bold">{user.name}</h1>
              <p className="text-xs text-slate-400">{user.plan}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
              {user.avatar}
            </div>
            <span className="font-bold">Personal Dashboard</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  closeMobileMenu();
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 ${
                  activeTab === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:pt-0 pt-16">
        <div className="p-4 lg:p-8">
          {/* Notifications */}
          <div className="flex justify-end mb-6">
            <NotificationsPanel />
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="flex justify-center items-center h-full gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 60 + 20}%`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome back, {user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-purple-100 text-lg">
                      Your personal dashboard is ready. Create QR codes to share your content with the world.
                    </p>
                  </div>

                  <Sparkles className="absolute top-4 right-4 text-white/30" size={48} />
                </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {statCards.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-xl`}>
                          <stat.icon size={24} className="text-white" />
                        </div>
                        {stat.change && (
                          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <ArrowUp size={14} />
                            {stat.change}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      {stat.description && (
                        <p className="text-xs text-slate-500 mt-2">{stat.description}</p>
                      )}
                      {stat.max && (
                        <div className="mt-3">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${stat.color} transition-all`}
                              style={{ width: `${(stat.value / stat.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              {/* Storage Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-orange-500 p-3 rounded-xl">
                      <HardDrive size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Storage</h3>
                      <p className="text-sm text-slate-600">
                        {formatBytes(stats.storageUsed)} of {formatBytes(stats.storageLimit)} used
                      </p>
                    </div>
                    <span className={`text-2xl font-bold ${
                      storagePercentage > 80 ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {storagePercentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        storagePercentage > 80 ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                  {storagePercentage > 80 && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      ⚠️ Storage almost full. Consider upgrading your plan.
                    </p>
                  )}
                </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Upload Button */}
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity group"
                    disabled={stats.uploads >= 3}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">Upload New Content</h3>
                      <p className="text-purple-200 text-sm">
                        {stats.uploads >= 3
                          ? 'Upload limit reached - Upgrade to add more'
                          : 'Add images, videos, audio, or text'}
                      </p>
                    </div>
                    <ChevronRight size={24} className="ml-auto" />
                  </button>

                  {/* View Items Button */}
                  <button
                    onClick={() => setActiveTab('items')}
                    className="bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-6 flex items-center gap-4 hover:border-purple-500 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <FolderOpen size={24} className="text-slate-600 group-hover:text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">View My Items</h3>
                      <p className="text-slate-600 text-sm">Manage your uploads and QR codes</p>
                    </div>
                    <ChevronRight size={24} className="ml-auto text-slate-400" />
                  </button>
                </div>

              {/* Recent Items */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Recent Items</h3>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1">
                      View All <ChevronRight size={16} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : recentItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">No items yet. Upload your first content!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentItems.map((item) => {
                        const TypeIcon = getTypeIcon(item.type);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TypeIcon size={20} className="text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <p className="text-sm text-slate-500">
                                  {item.views} views • {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                              <ExternalLink size={18} className="text-slate-400" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              {/* Upgrade Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mt-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-2">Ready to grow?</h3>
                      <p className="text-blue-100">
                        Upgrade to Small Business for unlimited uploads, advanced analytics, and more!
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                      Upgrade Now
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* ITEMS TAB */}
          {activeTab === 'items' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">My Items</h2>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Upload New
                    </button>
                  </div>

                  {recentItems.length === 0 ? (
                    <div className="text-center py-16">
                      <FolderOpen size={64} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No items yet</h3>
                      <p className="text-slate-500 mb-6">
                        Upload your first piece of content to get started
                      </p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                      >
                        Upload Content
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentItems.map((item) => {
                        const TypeIcon = getTypeIcon(item.type);
                        return (
                          <div
                            key={item.id}
                            className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                              <TypeIcon size={48} className="text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">
                              {item.views} views • {item.type}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowQRModal(item)}
                                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                              >
                                View QR
                              </button>
                              <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <Eye size={32} className="mx-auto text-green-600 mb-2" />
                      <p className="text-3xl font-bold text-slate-900">{stats.views}</p>
                      <p className="text-sm text-slate-600">Total Views</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <QrCode size={32} className="mx-auto text-purple-600 mb-2" />
                      <p className="text-3xl font-bold text-slate-900">{stats.qrCodes}</p>
                      <p className="text-sm text-slate-600">QR Codes Created</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <Upload size={32} className="mx-auto text-blue-600 mb-2" />
                      <p className="text-3xl font-bold text-slate-900">{stats.uploads}</p>
                      <p className="text-sm text-slate-600">Items Uploaded</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                    <Sparkles size={32} className="mx-auto text-purple-600 mb-2" />
                    <h3 className="font-bold text-slate-900 mb-2">Want More Analytics?</h3>
                    <p className="text-slate-600 mb-4">
                      Upgrade to see detailed insights, geographic data, device breakdowns, and more!
                    </p>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>

                  {/* Profile Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Profile</h3>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-slate-600">{user.email}</p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700 mt-1">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plan Section */}
                  <div className="mb-8 pb-8 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Current Plan</h3>
                    <div className="bg-slate-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{user.plan}</p>
                          <p className="text-sm text-slate-600">
                            {stats.uploads}/3 uploads • {formatBytes(stats.storageUsed)}/{formatBytes(stats.storageLimit)} storage
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                      Save Changes
                    </button>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>

      <GlobalAiChatWidget showBlinkingPrompt={true} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(item) => {
          // Refresh stats after successful upload
          setStats(prev => ({
            ...prev,
            uploads: prev.uploads + 1,
            qrCodes: prev.qrCodes + 1
          }));
        }}
      />

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">QR Code</h3>
              <button
                onClick={() => setShowQRModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center">
              <div className="bg-slate-100 rounded-xl p-6 mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${showQRModal.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'item'}`)}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{showQRModal.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{showQRModal.views} views • {showQRModal.type}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => alert(`Demo Mode: Would open content viewer for "${showQRModal.title}"\n\nIn production, this would display the actual uploaded content that customers see when they scan the QR code.`)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  View Linked Content
                </button>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleDownloadQR(
                      `https://outboundimpact.net/view/${showQRModal.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'item'}`,
                      `qr-${showQRModal.title}.png`
                    )}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-center"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => setShowQRModal(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
