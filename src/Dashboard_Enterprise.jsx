// ENTERPRISE VERSION
// Advanced features: Cohorts, Workflows, Audit Log, Multi-brand, Compliance
// Optimized for: Large organizations, multi-region, compliance requirements

import React, { useState } from 'react';
import { BarChart3, Upload, MessageSquare, TrendingUp, Users, Settings, Home, QrCode, Plus, ChevronRight, ArrowUp, Rocket, Eye, ChevronDown, HelpCircle, LogOut, CreditCard, FolderOpen, Menu, X, Video, Music, FileText, Trash2, UserPlus, Shield, GitBranch, Building2, FileCheck, Clock, Share2, Facebook, Instagram, Twitter, Linkedin, Link, Check, Reply } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import GlobalAiChatWidget from './components/GlobalAiChatWidget';
import UploadModal from './components/UploadModal';
import ComposeMessageModal from './components/ComposeMessageModal';

export default function Dashboard_Enterprise() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contentExpanded, setContentExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [timeFilter, setTimeFilter] = useState('daily');
  const [selectedCampaign, setSelectedCampaign] = useState('Summer Kitchen Remodel (Real Estate)');
  const [messageTab, setMessageTab] = useState('internal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  // Invite contributor modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Enterprise-specific state
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Cohort modal states
  const [managingCohort, setManagingCohort] = useState(null);
  const [assigningContent, setAssigningContent] = useState(null);
  const [editingCohort, setEditingCohort] = useState(null);

  // Workflow modal states
  const [approvingWorkflow, setApprovingWorkflow] = useState(null);
  const [requestingChanges, setRequestingChanges] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);

  // Role dropdown state
  const [editingRoleFor, setEditingRoleFor] = useState(null);

  // Upgrade plan modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  // Profile photo state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profileColor, setProfileColor] = useState('from-blue-500 to-purple-500');
  const [profileImage, setProfileImage] = useState(null);

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Account settings modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailPrefsModal, setShowEmailPrefsModal] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState({
    marketing: true,
    updates: true,
    security: true,
    weekly: false
  });

  // Help modals
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState({});

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleCopyLink = (campaignName) => {
    const link = `https://yourapp.com/campaign/${campaignName.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (platform, campaignName) => {
    const campaignUrl = encodeURIComponent(`https://yourapp.com/campaign/${campaignName.toLowerCase().replace(/\s+/g, '-')}`);
    const text = encodeURIComponent(`Check out our ${campaignName} campaign!`);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${campaignUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${campaignUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${campaignUrl}`,
      instagram: `https://www.instagram.com/`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const stats = [
    { label: 'Uploads', value: '8', icon: Upload, color: 'bg-blue-500', change: '+12%', tab: 'activity' },
    { label: 'Total Views', value: '4,154', icon: Eye, color: 'bg-green-500', change: '+8%', tab: 'analytics' },
    { label: 'QR Codes', value: '4', icon: QrCode, color: 'bg-purple-500', change: '+2', tab: 'qrcodes' },
    { label: 'Active Campaigns', value: '2', icon: Rocket, color: 'bg-orange-500', tab: 'campaigns' },
  ];

  const uploadTypes = [
    { label: 'Images', icon: Upload, color: 'bg-purple-600' },
    { label: 'Videos', icon: Video, color: 'bg-purple-600' },
    { label: 'Audio', icon: Music, color: 'bg-purple-600' },
    { label: 'Text', icon: FileText, color: 'bg-purple-600' },
    { label: 'Embed Link', icon: QrCode, color: 'bg-purple-600' },
  ];

  const campaigns = [
    'Summer Kitchen Remodel (Real Estate)',
    'Spring Product Launch',
    'Holiday Marketing Campaign',
  ];

  // Load messages from localStorage or use defaults, ensuring all have IDs
  const getStoredMessages = (key, defaults) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaults;
      const parsed = JSON.parse(stored);
      // Ensure all messages have IDs (migrate old data)
      return parsed.map((msg, idx) => ({
        ...msg,
        id: msg.id || `migrated-${key}-${idx}-${Date.now()}`
      }));
    } catch {
      return defaults;
    }
  };

  const defaultInternalMessages = [
    { id: 'demo-int-1', from: 'Pablo Rivera', subject: 'Campaign Update', preview: 'The summer campaign is performing well...', time: '2h ago', unread: true, body: 'The summer campaign is performing well. We have seen a 24% increase in engagement this week.' },
    { id: 'demo-int-2', from: 'Team Member', subject: 'New QR Code Generated', preview: 'I just created a QR code for the event...', time: '5h ago', unread: false, body: 'I just created a QR code for the event next week. Please review and let me know if any changes are needed.' },
  ];

  const defaultExternalMessages = [
    { id: 'demo-ext-1', from: 'client@example.com', subject: 'Campaign Approval', preview: 'The new campaign looks great! Approved...', time: '1d ago', unread: true, body: 'The new campaign looks great! Approved for launch. Looking forward to seeing the results.' },
    { id: 'demo-ext-2', from: 'partner@company.com', subject: 'Collaboration Request', preview: 'Would love to discuss potential partnership...', time: '2d ago', unread: false, body: 'Would love to discuss potential partnership opportunities. Please let me know your availability for a call this week.' },
  ];

  const [internalMessages, setInternalMessages] = useState(() =>
    getStoredMessages('enterprise_internalMessages', defaultInternalMessages)
  );

  const [externalMessages, setExternalMessages] = useState(() =>
    getStoredMessages('enterprise_externalMessages', defaultExternalMessages)
  );

  // Persist messages to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('enterprise_internalMessages', JSON.stringify(internalMessages));
  }, [internalMessages]);

  React.useEffect(() => {
    localStorage.setItem('enterprise_externalMessages', JSON.stringify(externalMessages));
  }, [externalMessages]);

  // Reset messages to defaults (for debugging/clearing old data)
  const resetMessages = () => {
    localStorage.removeItem('enterprise_internalMessages');
    localStorage.removeItem('enterprise_externalMessages');
    setInternalMessages(defaultInternalMessages);
    setExternalMessages(defaultExternalMessages);
  };

  const handleMessageSent = (message) => {
    if (message.type === 'internal') {
      setInternalMessages(prev => [{ ...message, from: 'You → ' + message.to }, ...prev]);
    } else {
      setExternalMessages(prev => [{ ...message, from: 'You → ' + message.to }, ...prev]);
    }
  };

  const handleDeleteMessage = (messageId, type) => {
    if (type === 'internal') {
      setInternalMessages(prev => prev.filter(m => m.id !== messageId));
    } else {
      setExternalMessages(prev => prev.filter(m => m.id !== messageId));
    }
    setSelectedMessage(null);
  };

  const handleReply = (message) => {
    const recipientEmail = message.to || message.from;
    setReplyTo({
      to: recipientEmail.replace('You → ', ''),
      subject: message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`
    });
    setShowComposeModal(true);
    setSelectedMessage(null);
  };

  const [contributorsList, setContributorsList] = useState([
    { email: 'paulmriv@gmail.com', name: 'Team Member', role: 'Editor', status: 'Accepted', invited: 'Jan 3, 2026', avatar: 'P' },
  ]);

  // Enterprise available roles (comprehensive)
  const availableRoles = ['Super Admin', 'Admin', 'Manager', 'Publisher', 'Reviewer', 'Editor', 'Viewer'];

  // Handle invite contributor
  const handleInviteContributor = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setInviteSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newContributor = {
      email: inviteEmail,
      name: inviteEmail.split('@')[0],
      role: inviteRole,
      status: 'Pending',
      invited: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: inviteEmail[0].toUpperCase()
    };

    setContributorsList(prev => [...prev, newContributor]);
    setInviteSending(false);
    setInviteSent(true);

    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
      setInviteRole('Editor');
      setShowInviteModal(false);
    }, 2000);
  };

  // Handle remove contributor
  const handleRemoveContributor = (email) => {
    if (confirm(`Remove ${email} from contributors?`)) {
      setContributorsList(prev => prev.filter(c => c.email !== email));
    }
  };

  // Handle role change
  const handleRoleChange = (email, newRole) => {
    setContributorsList(prev => prev.map(c =>
      c.email === email ? { ...c, role: newRole } : c
    ));
    setEditingRoleFor(null);
  };

  const recentActivity = [
    { name: 'Promo_Flyer.pdf', views: 243, campaign: 'Spring Launch', time: '2h ago', type: 'PDF', size: '2.4 MB', uploaded: 'Jan 3, 2026' },
    { name: 'Menu_QR.png', views: 118, campaign: null, time: '1d ago', type: 'Image', size: '856 KB', uploaded: 'Jan 2, 2026' },
    { name: 'Product_Video.mp4', views: 94, campaign: 'Video Ads', time: '1d ago', type: 'Video', size: '45.2 MB', uploaded: 'Jan 2, 2026' },
    { name: 'Brand_Guidelines.pdf', views: 67, campaign: 'Brand Update', time: '2d ago', type: 'PDF', size: '5.1 MB', uploaded: 'Jan 1, 2026' },
    { name: 'Event_Poster.jpg', views: 189, campaign: 'Spring Launch', time: '3d ago', type: 'Image', size: '3.2 MB', uploaded: 'Dec 31, 2025' },
    { name: 'Tutorial_Audio.mp3', views: 45, campaign: null, time: '4d ago', type: 'Audio', size: '12.8 MB', uploaded: 'Dec 30, 2025' },
    { name: 'Website_Banner.png', views: 278, campaign: 'Website Redesign', time: '5d ago', type: 'Image', size: '1.9 MB', uploaded: 'Dec 29, 2025' },
    { name: 'Campaign_Deck.pdf', views: 156, campaign: 'Q1 Planning', time: '6d ago', type: 'PDF', size: '8.7 MB', uploaded: 'Dec 28, 2025' },
  ];

  const qrCodes = [
    {
      id: 1,
      name: 'Store Front Window',
      location: 'Main Street Location',
      linkedContent: 'Promo_Flyer.pdf',
      views: 456,
      created: 'Jan 1, 2026',
      lastScanned: '2h ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Product Display - Kitchen',
      location: 'Showroom Floor 2',
      linkedContent: 'Product_Video.mp4',
      views: 289,
      created: 'Dec 28, 2025',
      lastScanned: '5h ago',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Business Cards',
      location: 'Distributed at Events',
      linkedContent: 'Website_Banner.png',
      views: 734,
      created: 'Dec 20, 2025',
      lastScanned: '1d ago',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Table Tent - Restaurant',
      location: 'Partner Location',
      linkedContent: 'Menu_QR.png',
      views: 1243,
      created: 'Dec 15, 2025',
      lastScanned: '3h ago',
      status: 'Active'
    },
  ];

  const [campaignsList, setCampaignsList] = useState([
    {
      name: 'Spring Product Launch',
      status: 'Active',
      startDate: 'Jan 1, 2026',
      endDate: 'Mar 31, 2026',
      assets: 5,
      views: 1456,
      qrCodes: 2,
      performance: '+24%'
    },
    {
      name: 'Summer Kitchen Remodel',
      status: 'Active',
      startDate: 'Dec 15, 2025',
      endDate: 'Feb 28, 2026',
      assets: 3,
      views: 892,
      qrCodes: 1,
      performance: '+18%'
    },
    {
      name: 'Holiday Marketing Campaign',
      status: 'Scheduled',
      startDate: 'Nov 1, 2026',
      endDate: 'Dec 31, 2026',
      assets: 0,
      views: 0,
      qrCodes: 0,
      performance: null
    },
  ]);

  // Handle saving edited campaign
  const handleSaveCampaign = (updatedCampaign) => {
    setCampaignsList(prev => prev.map(c =>
      c.name === editingCampaign.name ? { ...c, ...updatedCampaign } : c
    ));
    setEditingCampaign(null);
  };

  // ENTERPRISE-SPECIFIC DATA
  const cohorts = [
    {
      id: 1,
      name: 'VIP Customers',
      members: 234,
      campaigns: 5,
      qrCodes: 3,
      created: 'Jan 1, 2026',
      lastActivity: '2h ago',
      description: 'High-value repeat customers'
    },
    {
      id: 2,
      name: 'New Leads - Q1 2026',
      members: 1052,
      campaigns: 3,
      qrCodes: 2,
      created: 'Dec 15, 2025',
      lastActivity: '1d ago',
      description: 'Recent signups and prospects'
    },
    {
      id: 3,
      name: 'Regional - East Coast',
      members: 445,
      campaigns: 7,
      qrCodes: 8,
      created: 'Nov 20, 2025',
      lastActivity: '3h ago',
      description: 'All eastern region locations'
    },
    {
      id: 4,
      name: 'Partner Network',
      members: 89,
      campaigns: 4,
      qrCodes: 5,
      created: 'Oct 10, 2025',
      lastActivity: '5h ago',
      description: 'B2B partner organizations'
    },
  ];

  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      asset: 'Q1_Campaign_Video.mp4',
      status: 'Pending Review',
      submittedBy: 'John Doe',
      submittedDate: '2h ago',
      reviewers: ['Sarah Admin', 'Mike Manager'],
      comments: 3,
      version: 'v1.0'
    },
    {
      id: 2,
      asset: 'Product_Launch_Banner.jpg',
      status: 'Approved',
      submittedBy: 'Jane Smith',
      submittedDate: '1d ago',
      reviewers: ['Sarah Admin', 'Mike Manager', 'Tom Director'],
      approvedDate: '4h ago',
      comments: 1,
      version: 'v2.1'
    },
    {
      id: 3,
      asset: 'Newsletter_Template.pdf',
      status: 'Needs Changes',
      submittedBy: 'Mike Johnson',
      submittedDate: '3d ago',
      reviewers: ['Sarah Admin', 'Tom Director'],
      feedback: 'Update branding to match new guidelines',
      comments: 5,
      version: 'v1.3'
    },
    {
      id: 4,
      asset: 'Holiday_QR_Menu.png',
      status: 'Draft',
      submittedBy: 'Emily Chen',
      submittedDate: '4d ago',
      reviewers: [],
      comments: 0,
      version: 'v1.0'
    },
  ]);

  // Workflow actions
  const handleApproveWorkflow = (workflowId) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId ? { ...w, status: 'Approved', approvedDate: 'Just now' } : w
    ));
    setApprovingWorkflow(null);
  };

  const handleRequestChanges = (workflowId, feedback) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId ? { ...w, status: 'Needs Changes', feedback } : w
    ));
    setRequestingChanges(null);
  };

  const organizations = [
    {
      id: 1,
      name: 'Brand A - Consumer',
      regions: 3,
      campaigns: 12,
      assets: 45,
      qrCodes: 18,
      activeUsers: 23,
      compliance: '98%'
    },
    {
      id: 2,
      name: 'Brand B - Enterprise',
      regions: 5,
      campaigns: 8,
      assets: 32,
      qrCodes: 25,
      activeUsers: 45,
      compliance: '100%'
    },
    {
      id: 3,
      name: 'Brand C - Partner',
      regions: 2,
      campaigns: 5,
      assets: 18,
      qrCodes: 12,
      activeUsers: 12,
      compliance: '95%'
    },
  ];

  const auditLog = [
    {
      id: 1,
      action: 'Content Published',
      user: 'Sarah Admin',
      asset: 'Holiday_Campaign.pdf',
      timestamp: '2h ago',
      details: 'Published to production',
      ipAddress: '192.168.1.45'
    },
    {
      id: 2,
      action: 'Version Updated',
      user: 'Tom Editor',
      asset: 'QR_Menu.png',
      timestamp: '5h ago',
      version: 'v2.1 → v2.2',
      details: 'Updated pricing information',
      ipAddress: '192.168.1.52'
    },
    {
      id: 3,
      action: 'Cohort Created',
      user: 'Sarah Admin',
      cohort: 'VIP Customers',
      timestamp: '1d ago',
      details: 'Created new customer segment',
      ipAddress: '192.168.1.45'
    },
    {
      id: 4,
      action: 'Workflow Approved',
      user: 'Mike Manager',
      asset: 'Product_Launch_Banner.jpg',
      timestamp: '1d ago',
      details: 'Approved for publication',
      ipAddress: '192.168.1.78'
    },
    {
      id: 5,
      action: 'User Role Changed',
      user: 'Sarah Admin',
      targetUser: 'Emily Chen',
      timestamp: '2d ago',
      details: 'Role changed from Editor to Reviewer',
      ipAddress: '192.168.1.45'
    },
  ];

  const complianceData = [
    {
      campaign: 'Spring Product Launch',
      delivered: 1456,
      opened: 982,
      clicked: 654,
      compliance: '98%',
      issues: 2,
      issueDetails: 'Minor tracking discrepancies'
    },
    {
      campaign: 'Summer Kitchen Remodel',
      delivered: 892,
      opened: 645,
      clicked: 423,
      compliance: '100%',
      issues: 0,
      issueDetails: null
    },
    {
      campaign: 'Holiday Marketing',
      delivered: 0,
      opened: 0,
      clicked: 0,
      compliance: 'N/A',
      issues: 0,
      issueDetails: 'Scheduled for future'
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <Home size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <div className="mt-2">
            <button onClick={() => setContentExpanded(!contentExpanded)} className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FolderOpen size={18} />
                <span className="text-sm font-medium">Content</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${contentExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {contentExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                <button onClick={() => setActiveTab('uploads')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'uploads' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Upload size={16} />
                  <span>Uploads</span>
                </button>
                <button onClick={() => setActiveTab('qrcodes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'qrcodes' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <QrCode size={16} />
                  <span>QR Codes</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('campaigns')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'campaigns' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <Rocket size={18} />
            <span className="text-sm font-medium">Campaigns</span>
          </button>

          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Analytics</span>
          </button>

          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Messages</span>
          </button>

          <button onClick={() => setActiveTab('activity')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'activity' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <BarChart3 size={18} />
            <span className="text-sm font-medium">All Activity</span>
          </button>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enterprise</p>

            <button onClick={() => setActiveTab('cohorts')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'cohorts' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Users size={18} />
              <span className="text-sm font-medium">Cohorts</span>
            </button>

            <button onClick={() => setActiveTab('workflows')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'workflows' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
              <GitBranch size={18} />
              <span className="text-sm font-medium">Workflows</span>
            </button>

            <button onClick={() => setActiveTab('organizations')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'organizations' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Building2 size={18} />
              <span className="text-sm font-medium">Organizations</span>
            </button>

            <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'audit' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Clock size={18} />
              <span className="text-sm font-medium">Audit Log</span>
            </button>

            <button onClick={() => setActiveTab('compliance')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'compliance' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Shield size={18} />
              <span className="text-sm font-medium">Compliance</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <button onClick={() => setSettingsExpanded(!settingsExpanded)} className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${settingsExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {settingsExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                <button onClick={() => setActiveTab('contributors')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'contributors' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Users size={16} />
                  <span>Contributors</span>
                </button>
                <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'billing' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <CreditCard size={16} />
                  <span>Billing & Usage</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Users size={16} />
                  <span>Profile</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('help')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'help' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
            <HelpCircle size={18} />
            <span className="text-sm font-medium">Help / Support</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-2">Storage: <span className="font-semibold text-slate-900">12%</span></p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">PR</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Pablo Rivera</p>
              <p className="text-xs text-slate-500 truncate">pablo@email.com</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Home size={18} className="text-white" />
                </div>
                <span className="font-semibold text-slate-900">Dashboard</span>
              </div>
              <button onClick={closeMobileMenu} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-3 overflow-y-auto">
              <button onClick={() => { setActiveTab('dashboard'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <Home size={18} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <div className="mt-2">
                <button onClick={() => setContentExpanded(!contentExpanded)} className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={18} />
                    <span className="text-sm font-medium">Content</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${contentExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {contentExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button onClick={() => { setActiveTab('uploads'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'uploads' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Upload size={16} />
                      <span>Uploads</span>
                    </button>
                    <button onClick={() => { setActiveTab('qrcodes'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'qrcodes' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <QrCode size={16} />
                      <span>QR Codes</span>
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => { setActiveTab('campaigns'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'campaigns' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <Rocket size={18} />
                <span className="text-sm font-medium">Campaigns</span>
              </button>

              <button onClick={() => { setActiveTab('analytics'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <BarChart3 size={18} />
                <span className="text-sm font-medium">Analytics</span>
              </button>

              <button onClick={() => { setActiveTab('messages'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Messages</span>
              </button>

              <button onClick={() => { setActiveTab('activity'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'activity' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <BarChart3 size={18} />
                <span className="text-sm font-medium">All Activity</span>
              </button>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enterprise</p>

                <button onClick={() => { setActiveTab('cohorts'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'cohorts' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Users size={18} />
                  <span className="text-sm font-medium">Cohorts</span>
                </button>

                <button onClick={() => { setActiveTab('workflows'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'workflows' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <GitBranch size={18} />
                  <span className="text-sm font-medium">Workflows</span>
                </button>

                <button onClick={() => { setActiveTab('organizations'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'organizations' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Building2 size={18} />
                  <span className="text-sm font-medium">Organizations</span>
                </button>

                <button onClick={() => { setActiveTab('audit'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'audit' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Clock size={18} />
                  <span className="text-sm font-medium">Audit Log</span>
                </button>

                <button onClick={() => { setActiveTab('compliance'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'compliance' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Shield size={18} />
                  <span className="text-sm font-medium">Compliance</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button onClick={() => setSettingsExpanded(!settingsExpanded)} className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings size={18} />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${settingsExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {settingsExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button onClick={() => { setActiveTab('contributors'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'contributors' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Users size={16} />
                      <span>Contributors</span>
                    </button>
                    <button onClick={() => { setActiveTab('billing'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'billing' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <CreditCard size={16} />
                      <span>Billing & Usage</span>
                    </button>
                    <button onClick={() => { setActiveTab('profile'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Users size={16} />
                      <span>Profile</span>
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => { setActiveTab('help'); closeMobileMenu(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${activeTab === 'help' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                <HelpCircle size={18} />
                <span className="text-sm font-medium">Help / Support</span>
              </button>
            </nav>

            <div className="p-4 border-t border-slate-200">
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">Storage: <span className="font-semibold text-slate-900">12%</span></p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">PR</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">Pablo Rivera</p>
                  <p className="text-xs text-slate-500 truncate">pablo@email.com</p>
                </div>
              </div>
              <button
                onClick={() => { closeMobileMenu(); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} className="text-slate-700" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{activeTab === 'activity' ? 'All Activity' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                <p className="text-xs lg:text-sm text-slate-500">Overview and management</p>
              </div>
            </div>
            <NotificationsPanel dashboardType="enterprise" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'activity' && (
            <div className="max-w-7xl">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">All Activity</h2>
                  <p className="text-slate-600">Complete history of uploads</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                    <Upload size={18} />
                    Export CSV
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Upload size={18} />
                    Export Excel
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2">
                    <Upload size={18} />
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
                    <Upload size={18} />
                    Custom Export
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Asset Name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Size</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Views</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Campaign</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">{item.size}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-slate-900">{item.views}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">{item.campaign || '—'}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{item.uploaded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">Showing {recentActivity.length} activities</p>
                  <div className="flex gap-2">
                    <button disabled className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm opacity-50">Previous</button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
                    <button disabled className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm opacity-50">Next</button>
                  </div>
                </div>
              </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Total Assets</p>
                    <p className="text-3xl font-bold text-slate-900">{recentActivity.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {recentActivity.reduce((sum, item) => sum + item.views, 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Avg Views/Asset</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {Math.round(recentActivity.reduce((sum, item) => sum + item.views, 0) / recentActivity.length)}
                    </p>
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-purple-600 mb-2">Upload VIDEO</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-3">
                    Select Campaign <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg">
                    {campaigns.map((campaign, idx) => (
                      <option key={idx} value={campaign}>{campaign}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="w-full px-6 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create New Campaign
                </button>
              </div>
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-16 text-center hover:border-purple-400">
                <Upload size={48} className="text-purple-600 mx-auto mb-4" />
                <p className="text-xl font-semibold text-slate-900 mb-2">Drag and drop your video file here</p>
                <p className="text-slate-500">or click to browse</p>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 border-2 border-purple-600 rounded-lg">
                  <Video size={28} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">VIDEO</span>
                </button>
                {uploadTypes.filter(t => t.label !== 'Videos').map((type, idx) => (
                  <button key={idx} className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-purple-400">
                    <type.icon size={28} className="text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700">{type.label.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="max-w-5xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Messages</h2>
                  <p className="text-slate-600">Communicate with your team and external contacts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Reset all messages to defaults? This will clear your message history.')) {
                        resetMessages();
                      }
                    }}
                    className="px-4 py-3 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Compose
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200">
                  <button onClick={() => setMessageTab('internal')} className={`flex-1 px-6 py-4 font-semibold ${messageTab === 'internal' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    Internal Team Messages
                  </button>
                  <button onClick={() => setMessageTab('external')} className={`flex-1 px-6 py-4 font-semibold ${messageTab === 'external' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    External Emails
                  </button>
                </div>
                <div className="p-6">
                  {messageTab === 'internal' && (
                    <div className="space-y-3">
                      {internalMessages.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No internal messages yet</p>
                      ) : internalMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`p-4 rounded-lg border-2 ${msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'} hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                {msg.from.split(' ').map(n => n[0]).join('').slice(0,2)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{msg.from}</p>
                                <p className="text-sm text-slate-500">{msg.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {msg.unread && <span className="w-3 h-3 bg-blue-500 rounded-full"></span>}
                              {msg.status && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{msg.status}</span>}
                            </div>
                          </div>
                          <p className="font-medium text-slate-900 mb-1">{msg.subject}</p>
                          <p className="text-sm text-slate-600 mb-3">{msg.preview || msg.body?.substring(0, 100)}</p>
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setSelectedMessage({...msg, type: 'internal'})} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center gap-1">
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => handleReply(msg)} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1">
                              <Reply size={14} /> Reply
                            </button>
                            <button onClick={() => handleDeleteMessage(msg.id, 'internal')} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {messageTab === 'external' && (
                    <div className="space-y-3">
                      {externalMessages.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No external emails yet</p>
                      ) : externalMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`p-4 rounded-lg border-2 ${msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'} hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                                {msg.from[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{msg.from}</p>
                                <p className="text-sm text-slate-500">{msg.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {msg.unread && <span className="w-3 h-3 bg-blue-500 rounded-full"></span>}
                              {msg.status && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{msg.status}</span>}
                            </div>
                          </div>
                          <p className="font-medium text-slate-900 mb-1">{msg.subject}</p>
                          <p className="text-sm text-slate-600 mb-3">{msg.preview || msg.body?.substring(0, 100)}</p>
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setSelectedMessage({...msg, type: 'external'})} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center gap-1">
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => handleReply(msg)} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1">
                              <Reply size={14} /> Reply
                            </button>
                            <button onClick={() => handleDeleteMessage(msg.id, 'external')} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qrcodes' && (
            <div className="max-w-6xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">QR Codes</h2>
                  <p className="text-slate-600">Manage and track your QR codes</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Generate New QR Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-purple-200">
                          <QrCode size={40} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{qr.name}</h3>
                          <p className="text-sm text-slate-500">{qr.location}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {qr.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Linked Content:</span>
                        <button
                          onClick={() => alert(`Demo Mode: Would open "${qr.linkedContent}"\n\nIn production, this opens the actual content that customers see when scanning the QR code.`)}
                          className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {qr.linkedContent}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total Scans:</span>
                        <span className="font-bold text-purple-600">{qr.views}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Last Scanned:</span>
                        <span className="text-slate-900">{qr.lastScanned}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Created:</span>
                        <span className="text-slate-900">{qr.created}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setShowQRModal({ name: qr.name, linkedContent: qr.linkedContent, views: qr.views })}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm"
                      >
                        View QR
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm"
                      >
                        View Analytics
                      </button>
                      <button
                        onClick={() => setShowQRModal({ name: qr.name, linkedContent: qr.linkedContent, views: qr.views })}
                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium hover:bg-slate-100 text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total QR Codes</p>
                  <p className="text-3xl font-bold text-slate-900">{qrCodes.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Scans</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {qrCodes.reduce((sum, qr) => sum + qr.views, 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Avg Scans/QR</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.round(qrCodes.reduce((sum, qr) => sum + qr.views, 0) / qrCodes.length)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="max-w-6xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Campaigns</h2>
                  <p className="text-slate-600">Organize and track your marketing campaigns</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  New Campaign
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {campaignsList.map((campaign, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${campaign.status === 'Active' ? 'bg-green-100' : 'bg-orange-100'}`}>
                          <Rocket size={24} className={campaign.status === 'Active' ? 'text-green-600' : 'text-orange-600'} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{campaign.name}</h3>
                          <p className="text-sm text-slate-500">{campaign.startDate} - {campaign.endDate}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Uploads</p>
                        <p className="text-2xl font-bold text-slate-900">{campaign.assets}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Total Views</p>
                        <p className="text-2xl font-bold text-slate-900">{campaign.views}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">QR Codes</p>
                        <p className="text-2xl font-bold text-slate-900">{campaign.qrCodes}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Performance</p>
                        <p className={`text-2xl font-bold ${campaign.performance ? 'text-green-600' : 'text-slate-400'}`}>
                          {campaign.performance || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 text-sm"
                      >
                        View Uploads
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm"
                      >
                        View Analytics
                      </button>
                      <button
                        onClick={() => setEditingCampaign(campaign)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium hover:bg-slate-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShareModalOpen(campaign.name)}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 text-sm flex items-center gap-2"
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>

                    {/* Share Modal */}
                    {shareModalOpen === campaign.name && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Share Campaign</h3>
                            <button
                              onClick={() => setShareModalOpen(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <p className="text-sm text-slate-600 mb-6">{campaign.name}</p>

                          <div className="space-y-3 mb-6">
                            <button
                              onClick={() => handleSocialShare('facebook', campaign.name)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Facebook size={20} className="text-blue-600" />
                              <span className="font-medium text-blue-600">Share on Facebook</span>
                            </button>

                            <button
                              onClick={() => handleSocialShare('twitter', campaign.name)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                            >
                              <Twitter size={20} className="text-sky-600" />
                              <span className="font-medium text-sky-600">Share on Twitter</span>
                            </button>

                            <button
                              onClick={() => handleSocialShare('linkedin', campaign.name)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Linkedin size={20} className="text-blue-700" />
                              <span className="font-medium text-blue-700">Share on LinkedIn</span>
                            </button>

                            <button
                              onClick={() => handleSocialShare('instagram', campaign.name)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                            >
                              <Instagram size={20} className="text-pink-600" />
                              <span className="font-medium text-pink-600">Share on Instagram</span>
                            </button>
                          </div>

                          <div className="border-t border-slate-200 pt-4">
                            <p className="text-xs text-slate-600 mb-2">Or copy link</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={`https://yourapp.com/campaign/${campaign.name.toLowerCase().replace(/\s+/g, '-')}`}
                                readOnly
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                              />
                              <button
                                onClick={() => handleCopyLink(campaign.name)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                                  copiedLink
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                              >
                                {copiedLink ? <Check size={16} /> : <Link size={16} />}
                                {copiedLink ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Campaigns</p>
                  <p className="text-3xl font-bold text-slate-900">{campaignsList.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Active Now</p>
                  <p className="text-3xl font-bold text-green-600">
                    {campaignsList.filter(c => c.status === 'Active').length}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Campaign Views</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {campaignsList.reduce((sum, c) => sum + c.views, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-6xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-slate-900">3,482</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                    <ArrowUp size={12} />
                    +8% from last week
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Uploads</p>
                  <p className="text-3xl font-bold text-slate-900">124</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                    <ArrowUp size={12} />
                    +12% from last week
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-slate-900">24.5%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                    <ArrowUp size={12} />
                    +3.2% from last week
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Trends</h3>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Advanced analytics charts coming soon</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contributors' && (
            <div className="max-w-6xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-purple-600 mb-2">Contributors Management</h2>
                  <p className="text-pink-400">Manage your team members and permissions</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Invite Contributor
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="grid grid-cols-5 gap-4 p-6 bg-slate-50 border-b border-slate-200 font-medium text-slate-700 rounded-t-xl">
                  <div>Member</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Invited</div>
                  <div>Actions</div>
                </div>
                {contributorsList.map((contributor, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 p-6 items-center hover:bg-slate-50 last:rounded-b-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {contributor.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{contributor.email}</p>
                        <p className="text-sm text-slate-500">{contributor.name}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setEditingRoleFor(editingRoleFor === contributor.email ? null : contributor.email)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <span>{contributor.role}</span>
                        <ChevronDown size={14} className={`transition-transform ${editingRoleFor === contributor.email ? 'rotate-180' : ''}`} />
                      </button>
                      {editingRoleFor === contributor.email && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                          {availableRoles.map(role => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(contributor.email, role)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                                contributor.role === role ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-700'
                              }`}
                            >
                              {role}
                              {contributor.role === role && <span className="ml-2">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{availableRoles.length} role levels available</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        ✓ {contributor.status}
                      </span>
                    </div>
                    <div className="text-slate-600">{contributor.invited}</div>
                    <div>
                      <button
                        onClick={() => handleRemoveContributor(contributor.email)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Billing & Usage</h2>
                <p className="text-slate-600">Manage your subscription and view usage statistics</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Plan</h3>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {currentPlan === 'free' ? 'Free Plan' : currentPlan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
                    </p>
                    <p className="text-slate-600 mt-1">
                      {currentPlan === 'free' ? '250 GB storage included' : currentPlan === 'pro' ? '1 TB storage included' : 'Unlimited storage'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                  >
                    {currentPlan === 'enterprise' ? 'Manage Plan' : 'Upgrade Plan'}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Storage Usage</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">0.00 GB / 250.00 GB</span>
                    <span className="text-slate-600">0%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-slate-500">0 bytes used of 268,435,456,000 bytes</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h2>
                <p className="text-slate-600">Manage your account information</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                <div className="flex items-center gap-6 mb-6">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${profileColor} flex items-center justify-center text-white font-semibold text-2xl`}>
                      PR
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-semibold text-slate-900">Pablo Rivera</p>
                    <p className="text-slate-600">pablomrivera1976@gmail.com</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change Photo
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <p className="font-medium text-slate-900">Change Password</p>
                    <p className="text-sm text-slate-500">Update your password</p>
                  </button>
                  <button
                    onClick={() => setShowEmailPrefsModal(true)}
                    className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <p className="font-medium text-slate-900">Email Preferences</p>
                    <p className="text-sm text-slate-500">Manage notification settings</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Help & Support</h2>
                <p className="text-slate-600">Get help with using Outbound Impact</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Documentation</h3>
                  <p className="text-slate-600 mb-4">Learn how to use all features</p>
                  <button
                    onClick={() => setShowDocsModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Docs →
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <HelpCircle size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
                  <p className="text-slate-600 mb-4">Get help from our team</p>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Contact Us →
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <p className="font-medium text-slate-900 mb-2">How do I upload content?</p>
                    <p className="text-slate-600 text-sm">Click on Upload in the sidebar or use the Quick Actions button to upload images, videos, and other content.</p>
                  </div>
                  <div className="border-b border-slate-200 pb-4">
                    <p className="font-medium text-slate-900 mb-2">How do I track views?</p>
                    <p className="text-slate-600 text-sm">All uploaded content is automatically tracked. View analytics in the Analytics tab for detailed insights.</p>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-slate-900 mb-2">Can I invite team members?</p>
                    <p className="text-slate-600 text-sm">Yes! Go to Contributors Management to invite team members and assign roles.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-xl`}>
                          <stat.icon size={20} className="text-white" />
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
                      {stat.change && (
                        <p className="text-xs text-slate-500 mt-1">vs last wk</p>
                      )}
                      <button
                        onClick={() => setActiveTab(stat.tab)}
                        className="text-blue-600 text-sm font-medium mt-3 flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View details <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">1</p>
                      <p className="text-white text-opacity-90 text-sm">Team Members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('contributors')}
                    className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                  >
                    Manage Team
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">Views Over Time</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setTimeFilter('daily')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${timeFilter === 'daily' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        Daily
                      </button>
                      <button onClick={() => setTimeFilter('weekly')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${timeFilter === 'weekly' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        Weekly
                      </button>
                    </div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-end justify-center relative overflow-hidden p-4">
                    <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 180 L 50 170 L 100 160 L 150 140 L 200 135 L 250 145 L 300 130 L 350 125 L 400 115 L 450 100 L 500 95 L 550 85 L 600 70" fill="url(#areaGradient)" stroke="none" />
                      <path d="M 0 180 L 50 170 L 100 160 L 150 140 L 200 135 L 250 145 L 300 130 L 350 125 L 400 115 L 450 100 L 500 95 L 550 85 L 600 70" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="300" cy="130" r="4" fill="#3b82f6" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
                      <p className="text-xs text-slate-500">April 22</p>
                      <p className="text-sm font-semibold text-slate-900">254 Views</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                    <button onClick={() => setActiveTab('activity')} className="text-blue-600 text-sm font-medium hover:underline">
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Upload size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.time} • {item.views} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {/* ENTERPRISE FEATURES */}

          {activeTab === 'cohorts' && (
            <div className="max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Cohort Management</h2>
                  <p className="text-slate-600">Define and manage audience segments for targeted campaigns</p>
                </div>
                <button
                  onClick={() => alert('Create New Cohort\n\nDefine audience segments to target specific groups with tailored content.\n\nCohort creation coming soon!')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Cohort
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {cohorts.map((cohort) => (
                  <div key={cohort.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{cohort.name}</h3>
                        <p className="text-sm text-slate-500">{cohort.description}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Members</p>
                        <p className="text-2xl font-bold text-slate-900">{cohort.members}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Campaigns</p>
                        <p className="text-2xl font-bold text-slate-900">{cohort.campaigns}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">QR Codes</p>
                        <p className="text-2xl font-bold text-slate-900">{cohort.qrCodes}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Last Activity</p>
                        <p className="text-sm font-semibold text-slate-900">{cohort.lastActivity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setManagingCohort(cohort)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm"
                      >
                        Manage Members
                      </button>
                      <button
                        onClick={() => setAssigningContent(cohort)}
                        className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 text-sm"
                      >
                        Assign Content
                      </button>
                      <button
                        onClick={() => setEditingCohort(cohort)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium hover:bg-slate-100 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Total Cohorts</p>
                    <p className="text-3xl font-bold text-slate-900">{cohorts.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Total Members</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {cohorts.reduce((sum, c) => sum + c.members, 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600 mb-1">Avg Members/Cohort</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {Math.round(cohorts.reduce((sum, c) => sum + c.members, 0) / cohorts.length)}
                    </p>
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="max-w-6xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Content Workflows</h2>
                  <p className="text-slate-600">Manage content approval process from draft to publish</p>
                </div>

                <div className="mb-6 flex gap-2 flex-wrap">
                <button onClick={() => setWorkflowFilter('all')} className={`px-4 py-2 rounded-lg font-medium ${workflowFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  All
                </button>
                <button onClick={() => setWorkflowFilter('pending')} className={`px-4 py-2 rounded-lg font-medium ${workflowFilter === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                  Pending Review
                </button>
                <button onClick={() => setWorkflowFilter('approved')} className={`px-4 py-2 rounded-lg font-medium ${workflowFilter === 'approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  Approved
                </button>
                <button onClick={() => setWorkflowFilter('changes')} className={`px-4 py-2 rounded-lg font-medium ${workflowFilter === 'changes' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  Needs Changes
                </button>
                <button onClick={() => setWorkflowFilter('draft')} className={`px-4 py-2 rounded-lg font-medium ${workflowFilter === 'draft' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
                  Drafts
                </button>
              </div>

              <div className="space-y-4">
                {workflows
                  .filter(workflow => {
                    if (workflowFilter === 'pending') return workflow.status === 'Pending Review';
                    if (workflowFilter === 'approved') return workflow.status === 'Approved';
                    if (workflowFilter === 'changes') return workflow.status === 'Needs Changes';
                    if (workflowFilter === 'draft') return workflow.status === 'Draft';
                    return true;
                  })
                  .map((workflow) => (
                  <div key={workflow.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{workflow.asset}</h3>
                        <p className="text-sm text-slate-500">Submitted by {workflow.submittedBy} • {workflow.submittedDate}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        workflow.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        workflow.status === 'Pending Review' ? 'bg-orange-100 text-orange-700' :
                        workflow.status === 'Needs Changes' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Version</p>
                        <p className="text-sm font-semibold text-slate-900">{workflow.version}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Comments</p>
                        <p className="text-sm font-semibold text-slate-900">{workflow.comments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Reviewers</p>
                        <p className="text-sm font-semibold text-slate-900">{workflow.reviewers.length}</p>
                      </div>
                    </div>

                    {workflow.feedback && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">📝 {workflow.feedback}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setApprovingWorkflow(workflow)}
                        className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 text-sm"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => setRequestingChanges(workflow)}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 text-sm"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => setViewingDetails(workflow)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {workflows.filter(workflow => {
                  if (workflowFilter === 'pending') return workflow.status === 'Pending Review';
                  if (workflowFilter === 'approved') return workflow.status === 'Approved';
                  if (workflowFilter === 'changes') return workflow.status === 'Needs Changes';
                  if (workflowFilter === 'draft') return workflow.status === 'Draft';
                  return true;
                }).length === 0 && (
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <p className="text-slate-500">No workflows found with status "{workflowFilter === 'pending' ? 'Pending Review' : workflowFilter === 'approved' ? 'Approved' : workflowFilter === 'changes' ? 'Needs Changes' : 'Draft'}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Multi-Brand Management</h2>
                  <p className="text-slate-600">Manage multiple brands and regional operations</p>
                </div>
                <select value={selectedOrganization} onChange={(e) => setSelectedOrganization(e.target.value)} className="px-4 py-2 border-2 border-slate-300 rounded-lg font-medium">
                  <option value="all">All Brands</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 mb-6">
                {organizations
                  .filter(org => selectedOrganization === 'all' || org.name === selectedOrganization)
                  .map((org) => (
                  <div key={org.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{org.name}</h3>
                          <p className="text-sm text-slate-500">{org.regions} regions • {org.activeUsers} active users</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        org.compliance === '100%' ? 'bg-green-100 text-green-700' :
                        parseInt(org.compliance) >= 95 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {org.compliance} Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Regions</p>
                        <p className="text-2xl font-bold text-slate-900">{org.regions}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Campaigns</p>
                        <p className="text-2xl font-bold text-slate-900">{org.campaigns}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Uploads</p>
                        <p className="text-2xl font-bold text-slate-900">{org.assets}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">QR Codes</p>
                        <p className="text-2xl font-bold text-slate-900">{org.qrCodes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">{selectedOrganization === 'all' ? 'Total Brands' : 'Brand'}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {selectedOrganization === 'all' ? organizations.length : 1}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">{selectedOrganization === 'all' ? 'Total Regions' : 'Regions'}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {organizations
                      .filter(org => selectedOrganization === 'all' || org.name === selectedOrganization)
                      .reduce((sum, o) => sum + o.regions, 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">{selectedOrganization === 'all' ? 'Total Active Users' : 'Active Users'}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {organizations
                      .filter(org => selectedOrganization === 'all' || org.name === selectedOrganization)
                      .reduce((sum, o) => sum + o.activeUsers, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="max-w-6xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Audit Log & Version History</h2>
                  <p className="text-slate-600">Track all system changes and user actions</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Timestamp</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">User</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Action</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Details</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6 text-sm text-slate-600">{log.timestamp}</td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{log.user}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.action.includes('Published') ? 'bg-green-100 text-green-700' :
                            log.action.includes('Updated') ? 'bg-blue-100 text-blue-700' :
                            log.action.includes('Created') ? 'bg-purple-100 text-purple-700' :
                            log.action.includes('Approved') ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {log.asset && <span className="font-medium">{log.asset}</span>}
                          {log.cohort && <span className="font-medium">{log.cohort}</span>}
                          {log.targetUser && <span className="font-medium">{log.targetUser}</span>}
                          {log.version && <span className="ml-2 text-xs">({log.version})</span>}
                          <br />
                          <span className="text-xs">{log.details}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">Showing {auditLog.length} recent entries</p>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
                  >
                    Export Full Log
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="max-w-6xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Compliance & Delivery Analytics</h2>
                  <p className="text-slate-600">Monitor delivery rates and compliance metrics</p>
                </div>

                <div className="space-y-4 mb-6">
                {complianceData.map((data, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{data.campaign}</h3>
                        {data.issueDetails && (
                          <p className="text-sm text-orange-600">⚠️ {data.issueDetails}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        data.compliance === '100%' ? 'bg-green-100 text-green-700' :
                        data.compliance === 'N/A' ? 'bg-slate-100 text-slate-700' :
                        parseInt(data.compliance) >= 95 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.compliance} Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Delivered</p>
                        <p className="text-2xl font-bold text-slate-900">{data.delivered}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Opened</p>
                        <p className="text-2xl font-bold text-slate-900">{data.opened}</p>
                        {data.delivered > 0 && (
                          <p className="text-xs text-slate-500">{Math.round((data.opened / data.delivered) * 100)}%</p>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Clicked</p>
                        <p className="text-2xl font-bold text-slate-900">{data.clicked}</p>
                        {data.delivered > 0 && (
                          <p className="text-xs text-slate-500">{Math.round((data.clicked / data.delivered) * 100)}%</p>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Issues</p>
                        <p className={`text-2xl font-bold ${data.issues === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {data.issues}
                        </p>
                      </div>
                    </div>

                    {data.issues > 0 && (
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setActiveTab('audit')}
                          className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 text-sm"
                        >
                          View Issues
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm"
                        >
                          Generate Report
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Overall Compliance</p>
                  <p className="text-3xl font-bold text-green-600">98%</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Delivered</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {complianceData.reduce((sum, d) => sum + d.delivered, 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                  <p className={`text-3xl font-bold ${complianceData.reduce((sum, d) => sum + d.issues, 0) === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {complianceData.reduce((sum, d) => sum + d.issues, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        campaigns={campaigns}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${showQRModal.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'item'}`)}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{showQRModal.name}</h4>
              <p className="text-sm text-slate-500 mb-4">{showQRModal.views} scans • {showQRModal.linkedContent}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => alert(`Demo Mode: Would open content viewer for "${showQRModal.linkedContent || showQRModal.name}"\n\nIn production, this would display the actual uploaded content that customers see when they scan the QR code.`)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  View Linked Content
                </button>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleDownloadQR(
                      `https://outboundimpact.net/view/${showQRModal.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'item'}`,
                      `qr-${showQRModal.name}.png`
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

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => { setShowComposeModal(false); setReplyTo(null); }}
        onMessageSent={handleMessageSent}
        dashboardType="enterprise"
        replyTo={replyTo}
      />

      {/* Invite Contributor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold">Invite Contributor</h2>
                <p className="text-purple-100 text-sm">Add team members to your organization</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Success State */}
            {inviteSent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Invitation Sent!</h3>
                <p className="text-slate-600">An invite has been sent to {inviteEmail}</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Email Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Role Select */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Role Permissions Info */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Role Permissions:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {inviteRole === 'Super Admin' && (
                      <>
                        <li>• Full organization access</li>
                        <li>• Can manage all brands and teams</li>
                        <li>• Can manage billing and compliance</li>
                      </>
                    )}
                    {inviteRole === 'Admin' && (
                      <>
                        <li>• Full access to assigned brands</li>
                        <li>• Can manage team members</li>
                        <li>• Can manage workflows</li>
                      </>
                    )}
                    {inviteRole === 'Manager' && (
                      <>
                        <li>• Can manage content and campaigns</li>
                        <li>• Can approve workflows</li>
                        <li>• Can view analytics</li>
                      </>
                    )}
                    {inviteRole === 'Publisher' && (
                      <>
                        <li>• Can publish approved content</li>
                        <li>• Can manage QR codes</li>
                        <li>• Can view analytics</li>
                      </>
                    )}
                    {inviteRole === 'Reviewer' && (
                      <>
                        <li>• Can review and approve content</li>
                        <li>• Can comment on submissions</li>
                        <li>• Cannot publish directly</li>
                      </>
                    )}
                    {inviteRole === 'Editor' && (
                      <>
                        <li>• Can upload and edit content</li>
                        <li>• Can submit for approval</li>
                        <li>• Can view analytics</li>
                      </>
                    )}
                    {inviteRole === 'Viewer' && (
                      <>
                        <li>• Read-only access</li>
                        <li>• Can view analytics</li>
                        <li>• Cannot modify content</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteContributor}
                    disabled={inviteSending || !inviteEmail}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      inviteSending || !inviteEmail
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {inviteSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Message Details</h3>
                <p className="text-purple-200 text-sm">{selectedMessage.type === 'internal' ? 'Internal Team Message' : 'External Email'}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">From</p>
                <p className="font-semibold text-slate-900">{selectedMessage.from}</p>
              </div>
              {selectedMessage.to && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">To</p>
                  <p className="font-semibold text-slate-900">{selectedMessage.to}</p>
                </div>
              )}
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Subject</p>
                <p className="font-semibold text-slate-900">{selectedMessage.subject}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Received</p>
                <p className="text-slate-700">{selectedMessage.time}</p>
              </div>
              {selectedMessage.status && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">{selectedMessage.status}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <p className="text-sm text-slate-500 mb-2">Message</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.body || selectedMessage.preview}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id, selectedMessage.type)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReply(selectedMessage)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                >
                  <Reply size={16} /> Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Edit Campaign</h3>
                <p className="text-purple-200 text-sm">Update campaign details</p>
              </div>
              <button
                onClick={() => setEditingCampaign(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveCampaign({
                  name: formData.get('name'),
                  status: formData.get('status'),
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate'),
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCampaign.name}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingCampaign.status}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    name="startDate"
                    defaultValue={editingCampaign.startDate}
                    placeholder="Jan 1, 2026"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    name="endDate"
                    defaultValue={editingCampaign.endDate}
                    placeholder="Mar 31, 2026"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {managingCohort && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Manage Members</h3>
                <p className="text-blue-200 text-sm">{managingCohort.name} • {managingCohort.members} members</p>
              </div>
              <button
                onClick={() => setManagingCohort(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search members by name or email..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Add Member
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'John Smith', email: 'john@example.com', joined: 'Jan 5, 2026', status: 'Active' },
                  { name: 'Sarah Johnson', email: 'sarah@example.com', joined: 'Jan 3, 2026', status: 'Active' },
                  { name: 'Mike Chen', email: 'mike@example.com', joined: 'Dec 28, 2025', status: 'Active' },
                  { name: 'Emily Davis', email: 'emily@example.com', joined: 'Dec 20, 2025', status: 'Inactive' },
                  { name: 'Alex Wilson', email: 'alex@example.com', joined: 'Dec 15, 2025', status: 'Active' },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {member.status}
                      </span>
                      <button className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">Showing 5 of {managingCohort.members} members</p>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setManagingCohort(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Content Modal */}
      {assigningContent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Assign Content</h3>
                <p className="text-purple-200 text-sm">Share content with {assigningContent.name}</p>
              </div>
              <button
                onClick={() => setAssigningContent(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-slate-600 mb-4">Select content to share with all {assigningContent.members} members in this cohort:</p>
              <div className="space-y-3">
                {[
                  { name: 'Product Catalog 2026', type: 'PDF', views: 1234 },
                  { name: 'Company Overview Video', type: 'Video', views: 856 },
                  { name: 'Holiday Promo Flyer', type: 'Image', views: 2341 },
                  { name: 'New Feature Announcement', type: 'PDF', views: 567 },
                  { name: 'Customer Success Story', type: 'Video', views: 432 },
                ].map((content, idx) => (
                  <label key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 border-2 border-transparent has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                      <div>
                        <p className="font-medium text-slate-900">{content.name}</p>
                        <p className="text-sm text-slate-500">{content.type} • {content.views} views</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setAssigningContent(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Content assigned to "${assigningContent.name}" cohort!\n\nAll ${assigningContent.members} members will now have access to the selected content.`);
                  setAssigningContent(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cohort Modal */}
      {editingCohort && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Edit Cohort</h3>
                <p className="text-slate-300 text-sm">Update cohort details</p>
              </div>
              <button
                onClick={() => setEditingCohort(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                alert(`Cohort "${formData.get('name')}" updated successfully!`);
                setEditingCohort(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cohort Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCohort.name}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingCohort.description}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue="Active"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  <strong>Members:</strong> {editingCohort.members} •
                  <strong> Campaigns:</strong> {editingCohort.campaigns} •
                  <strong> Created:</strong> {editingCohort.created}
                </p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCohort(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Workflow Modal */}
      {approvingWorkflow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Approve Asset</h3>
                <p className="text-green-200 text-sm">Confirm approval</p>
              </div>
              <button
                onClick={() => setApprovingWorkflow(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-green-800">{approvingWorkflow.asset}</p>
                <p className="text-sm text-green-600 mt-1">Submitted by {approvingWorkflow.submittedBy} • {approvingWorkflow.submittedDate}</p>
              </div>
              <p className="text-slate-600 mb-4">Are you sure you want to approve this asset? It will be published and available for use.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Approval Note (optional)</label>
                <textarea
                  id="approvalNote"
                  rows={2}
                  placeholder="Add a note for the submitter..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setApprovingWorkflow(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveWorkflow(approvingWorkflow.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  ✓ Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {requestingChanges && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Request Changes</h3>
                <p className="text-red-200 text-sm">Provide feedback</p>
              </div>
              <button
                onClick={() => setRequestingChanges(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const feedback = e.target.feedback.value;
                if (feedback.trim()) {
                  handleRequestChanges(requestingChanges.id, feedback);
                }
              }}
              className="p-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-800">{requestingChanges.asset}</p>
                <p className="text-sm text-red-600 mt-1">Submitted by {requestingChanges.submittedBy} • {requestingChanges.submittedDate}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback / Required Changes *</label>
                <textarea
                  name="feedback"
                  rows={4}
                  placeholder="Describe what changes are needed..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRequestingChanges(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">View Details</h3>
                <p className="text-blue-200 text-sm">{viewingDetails.asset}</p>
              </div>
              <button
                onClick={() => setViewingDetails(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-100 rounded-xl p-8 mb-4 flex items-center justify-center min-h-[200px]">
                {viewingDetails.asset.endsWith('.mp4') && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <p className="text-slate-600">Video Preview</p>
                    <p className="text-sm text-slate-400">{viewingDetails.asset}</p>
                  </div>
                )}
                {viewingDetails.asset.endsWith('.jpg') || viewingDetails.asset.endsWith('.png') ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">🖼️</span>
                    </div>
                    <p className="text-slate-600">Image Preview</p>
                    <p className="text-sm text-slate-400">{viewingDetails.asset}</p>
                  </div>
                ) : null}
                {viewingDetails.asset.endsWith('.pdf') && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-slate-600">PDF Document</p>
                    <p className="text-sm text-slate-400">{viewingDetails.asset}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Submitted By</p>
                  <p className="font-medium text-slate-900">{viewingDetails.submittedBy}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Submitted</p>
                  <p className="font-medium text-slate-900">{viewingDetails.submittedDate}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Version</p>
                  <p className="font-medium text-slate-900">{viewingDetails.version}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewingDetails.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    viewingDetails.status === 'Pending Review' ? 'bg-orange-100 text-orange-700' :
                    viewingDetails.status === 'Needs Changes' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {viewingDetails.status}
                  </span>
                </div>
              </div>
              {viewingDetails.feedback && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-red-800">Feedback:</p>
                  <p className="text-sm text-red-700">{viewingDetails.feedback}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingDetails(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert(`Demo Mode: Would download ${viewingDetails.asset}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Choose Your Plan</h3>
                <p className="text-purple-200 text-sm">Select the plan that best fits your needs</p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`border-2 rounded-xl p-6 ${currentPlan === 'free' ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900">Free</h4>
                    <p className="text-3xl font-bold text-slate-900 mt-2">$0<span className="text-sm font-normal text-slate-500">/month</span></p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 250 GB storage
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 3 team members
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Basic analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 5 QR codes
                    </li>
                  </ul>
                  <button
                    onClick={() => { setCurrentPlan('free'); setShowUpgradeModal(false); }}
                    disabled={currentPlan === 'free'}
                    className={`w-full py-2 rounded-lg font-medium ${currentPlan === 'free' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`border-2 rounded-xl p-6 relative ${currentPlan === 'pro' ? 'border-purple-500 bg-purple-50' : 'border-blue-500'}`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900">Pro</h4>
                    <p className="text-3xl font-bold text-slate-900 mt-2">$29<span className="text-sm font-normal text-slate-500">/month</span></p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 1 TB storage
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 10 team members
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Advanced analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Unlimited QR codes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Priority support
                    </li>
                  </ul>
                  <button
                    onClick={() => { setCurrentPlan('pro'); setShowUpgradeModal(false); }}
                    className={`w-full py-2 rounded-lg font-medium ${currentPlan === 'pro' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {currentPlan === 'pro' ? 'Current Plan' : currentPlan === 'enterprise' ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className={`border-2 rounded-xl p-6 ${currentPlan === 'enterprise' ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-slate-900">Enterprise</h4>
                    <p className="text-3xl font-bold text-slate-900 mt-2">$99<span className="text-sm font-normal text-slate-500">/month</span></p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Unlimited storage
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Unlimited team members
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Custom analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> Unlimited QR codes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> 24/7 dedicated support
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-green-500" /> SSO & compliance
                    </li>
                  </ul>
                  <button
                    onClick={() => { setCurrentPlan('enterprise'); setShowUpgradeModal(false); }}
                    className={`w-full py-2 rounded-lg font-medium ${currentPlan === 'enterprise' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {currentPlan === 'enterprise' ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-6">
                All plans include a 14-day free trial. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Change Profile Photo</h3>
                <p className="text-blue-200 text-sm">Upload a photo or choose a color</p>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Preview */}
              <div className="flex justify-center mb-6">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${profileColor} flex items-center justify-center text-white font-semibold text-3xl`}>
                    PR
                  </div>
                )}
              </div>

              {/* Upload Photo */}
              <div className="mb-6">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Click to upload photo</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Remove photo button if image exists */}
              {profileImage && (
                <button
                  onClick={() => setProfileImage(null)}
                  className="w-full mb-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Remove Photo
                </button>
              )}

              {/* Color options (only show if no image) */}
              {!profileImage && (
                <>
                  <p className="text-sm text-slate-600 text-center mb-4">Or choose a color theme</p>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { name: 'Blue-Purple', value: 'from-blue-500 to-purple-500' },
                      { name: 'Green-Teal', value: 'from-green-500 to-teal-500' },
                      { name: 'Orange-Red', value: 'from-orange-500 to-red-500' },
                      { name: 'Pink-Rose', value: 'from-pink-500 to-rose-500' },
                      { name: 'Indigo-Blue', value: 'from-indigo-500 to-blue-500' },
                      { name: 'Yellow-Orange', value: 'from-yellow-500 to-orange-500' },
                      { name: 'Cyan-Blue', value: 'from-cyan-500 to-blue-500' },
                      { name: 'Purple-Pink', value: 'from-purple-500 to-pink-500' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setProfileColor(color.value)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${color.value} ${profileColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Change Password</h3>
                <p className="text-slate-300 text-sm">Update your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Password must be at least 8 characters with uppercase, lowercase, and numbers.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Password updated successfully! (Demo)');
                    setShowPasswordModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preferences Modal */}
      {showEmailPrefsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Email Preferences</h3>
                <p className="text-blue-200 text-sm">Manage your notification settings</p>
              </div>
              <button
                onClick={() => setShowEmailPrefsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Marketing Emails</p>
                    <p className="text-sm text-slate-500">Receive product updates and offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPrefs.marketing}
                    onChange={(e) => setEmailPrefs({...emailPrefs, marketing: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Product Updates</p>
                    <p className="text-sm text-slate-500">New features and improvements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPrefs.updates}
                    onChange={(e) => setEmailPrefs({...emailPrefs, updates: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Security Alerts</p>
                    <p className="text-sm text-slate-500">Important account security updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPrefs.security}
                    onChange={(e) => setEmailPrefs({...emailPrefs, security: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Weekly Digest</p>
                    <p className="text-sm text-slate-500">Weekly summary of your activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPrefs.weekly}
                    onChange={(e) => setEmailPrefs({...emailPrefs, weekly: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEmailPrefsModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Email preferences saved! (Demo)');
                    setShowEmailPrefsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Documentation</h3>
                <p className="text-blue-200 text-sm">Learn how to use Outbound Impact</p>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Getting Started */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDocs({...expandedDocs, gettingStarted: !expandedDocs.gettingStarted})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900">Getting Started</h4>
                    <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedDocs.gettingStarted ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDocs.gettingStarted && (
                    <div className="p-4 space-y-3">
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc1: !expandedDocs.doc1})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc1 ? 'rotate-90' : ''}`} />
                          Creating your first campaign
                        </div>
                        {expandedDocs.doc1 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Navigate to Campaigns in the sidebar and click "New Campaign". Enter a campaign name, description, and select your target audience. You can add content and QR codes to your campaign after creation.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc2: !expandedDocs.doc2})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc2 ? 'rotate-90' : ''}`} />
                          Uploading content (images, videos, PDFs)
                        </div>
                        {expandedDocs.doc2 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Click the Upload button in the sidebar or use Quick Actions. Drag and drop files or click to browse. Supported formats: JPG, PNG, GIF, MP4, MOV, PDF. Max file size: 100MB for videos, 10MB for images.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc3: !expandedDocs.doc3})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc3 ? 'rotate-90' : ''}`} />
                          Generating QR codes
                        </div>
                        {expandedDocs.doc3 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Go to QR Codes section and click "Generate New". Enter the destination URL or select existing content. Customize the design, then download as PNG or SVG. QR codes automatically track scans.</p>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Management */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDocs({...expandedDocs, teamMgmt: !expandedDocs.teamMgmt})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900">Team Management</h4>
                    <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedDocs.teamMgmt ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDocs.teamMgmt && (
                    <div className="p-4 space-y-3">
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc4: !expandedDocs.doc4})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc4 ? 'rotate-90' : ''}`} />
                          Inviting team members
                        </div>
                        {expandedDocs.doc4 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Go to Contributors and click "Invite Contributor". Enter their email address and select a role. They'll receive an email invitation to join your organization.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc5: !expandedDocs.doc5})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc5 ? 'rotate-90' : ''}`} />
                          Managing roles and permissions
                        </div>
                        {expandedDocs.doc5 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Available roles: Super Admin, Admin, Manager, Publisher, Reviewer, Editor, Viewer. Each role has different permissions. Click on a team member's role to change it.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc6: !expandedDocs.doc6})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc6 ? 'rotate-90' : ''}`} />
                          Content approval workflows
                        </div>
                        {expandedDocs.doc6 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Set up approval workflows in Workflows section. Content submitted by Editors goes through review. Reviewers and Managers can approve or request changes before publishing.</p>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Analytics & Reporting */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDocs({...expandedDocs, analytics: !expandedDocs.analytics})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900">Analytics & Reporting</h4>
                    <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedDocs.analytics ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDocs.analytics && (
                    <div className="p-4 space-y-3">
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc7: !expandedDocs.doc7})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc7 ? 'rotate-90' : ''}`} />
                          Understanding your dashboard
                        </div>
                        {expandedDocs.doc7 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">The dashboard shows key metrics: total views, QR scans, engagement rate, and content performance. Use the time filter to view daily, weekly, or monthly data.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc8: !expandedDocs.doc8})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc8 ? 'rotate-90' : ''}`} />
                          Tracking QR code scans
                        </div>
                        {expandedDocs.doc8 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Each QR code tracks: total scans, unique visitors, location data, device types, and time of scan. View detailed analytics by clicking on any QR code.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc9: !expandedDocs.doc9})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc9 ? 'rotate-90' : ''}`} />
                          Exporting reports
                        </div>
                        {expandedDocs.doc9 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Go to Analytics and click Export. Choose date range and metrics. Export as CSV or PDF. Schedule automated weekly or monthly reports via Email Preferences.</p>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Enterprise Features */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDocs({...expandedDocs, enterprise: !expandedDocs.enterprise})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900">Enterprise Features</h4>
                    <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedDocs.enterprise ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDocs.enterprise && (
                    <div className="p-4 space-y-3">
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc10: !expandedDocs.doc10})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc10 ? 'rotate-90' : ''}`} />
                          Multi-brand management
                        </div>
                        {expandedDocs.doc10 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Manage multiple brands from one dashboard. Go to Organizations to switch between brands. Each brand has separate content, campaigns, and team members.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc11: !expandedDocs.doc11})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc11 ? 'rotate-90' : ''}`} />
                          Cohort targeting
                        </div>
                        {expandedDocs.doc11 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">Create cohorts in the Cohorts section. Add members manually or import from CSV. Assign specific content to cohorts for targeted campaigns.</p>
                        )}
                      </button>
                      <button onClick={() => setExpandedDocs({...expandedDocs, doc12: !expandedDocs.doc12})} className="w-full text-left">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <ChevronRight size={14} className={`transition-transform ${expandedDocs.doc12 ? 'rotate-90' : ''}`} />
                          Audit logs and compliance
                        </div>
                        {expandedDocs.doc12 && (
                          <p className="mt-2 ml-6 text-sm text-slate-600">View all system activity in Audit Log. Track user actions, content changes, and login history. Export logs for compliance reporting. Logs retained for 2 years.</p>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                onClick={() => setShowDocsModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Contact Support</h3>
                <p className="text-purple-200 text-sm">We're here to help</p>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>General Question</option>
                    <option>Technical Issue</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or question..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">We'll reply to contact@outboundimpact.com</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">Our support team typically responds within 24 hours.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Support request submitted! We\'ll get back to you soon. (Demo)');
                    setShowContactModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Log Out?</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    // In production, this would clear auth tokens and redirect
                    alert('You have been logged out. (Demo - would redirect to login page)');
                    // window.location.href = '/login';
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Log Out
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
