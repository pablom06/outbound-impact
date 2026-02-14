// MEDIUM BUSINESS DASHBOARD
// Updated: Invite Contributors functionality fixed
import React, { useState, useEffect } from 'react';
import { BarChart3, Upload, MessageSquare, TrendingUp, Users, Settings, Home, QrCode, Plus, ChevronRight, ArrowUp, Rocket, Eye, ChevronDown, HelpCircle, LogOut, CreditCard, FolderOpen, Menu, X, Video, Music, FileText, Trash2, UserPlus, Share2, Facebook, Instagram, Twitter, Linkedin, Link, Check, Smartphone, MousePointer, Reply, Mail } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import UploadModal from './components/UploadModal';
import GlobalAiChatWidget from './components/GlobalAiChatWidget';
import ComposeMessageModal from './components/ComposeMessageModal';

export default function ResponsiveDashboard() {
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [contributorsList, setContributorsList] = useState([
    { email: 'paulmriv@gmail.com', name: 'Team Member', role: 'Editor', status: 'Accepted', invited: 'Jan 3, 2026', avatar: 'P' },
  ]);
  const [editingCampaign, setEditingCampaign] = useState(null);

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
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing, opens app
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const stats = [
    { label: 'Uploads', value: '8', icon: Upload, color: 'bg-blue-500', change: '+12%', tab: 'activity' },
    { label: 'Total Views', value: '4,154', icon: Eye, color: 'bg-green-500', change: '+8%', subtitle: 'All access methods', tab: 'analytics' },
    { label: 'QR Scans', value: '2,891', icon: Smartphone, color: 'bg-indigo-500', change: '+15%', subtitle: 'Physical scans/taps', tab: 'analytics' },
    { label: 'Link Clicks', value: '1,263', icon: MousePointer, color: 'bg-teal-500', change: '-2%', subtitle: 'Direct link access', tab: 'analytics' },
    { label: 'QR Codes', value: '4', icon: QrCode, color: 'bg-purple-500', change: '+2', subtitle: 'Total codes created', tab: 'qrcodes' },
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
    getStoredMessages('medium_internalMessages', defaultInternalMessages)
  );

  const [externalMessages, setExternalMessages] = useState(() =>
    getStoredMessages('medium_externalMessages', defaultExternalMessages)
  );

  // Persist messages to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('medium_internalMessages', JSON.stringify(internalMessages));
  }, [internalMessages]);

  React.useEffect(() => {
    localStorage.setItem('medium_externalMessages', JSON.stringify(externalMessages));
  }, [externalMessages]);

  // Reset messages to defaults (for debugging/clearing old data)
  const resetMessages = () => {
    localStorage.removeItem('medium_internalMessages');
    localStorage.removeItem('medium_externalMessages');
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

  // Handle invite contributor
  const handleInviteContributor = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setInviteSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add to contributors list
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

    // Reset after showing success
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
      setInviteRole('Editor');
      setShowInviteModal(false);
    }, 2000);
  };

  const handleRemoveContributor = (email) => {
    if (confirm(`Remove ${email} from contributors?`)) {
      setContributorsList(prev => prev.filter(c => c.email !== email));
    }
  };

  // Medium Business available roles
  const availableRoles = ['Admin', 'Manager', 'Editor', 'Viewer'];

  // Default recent activity data
  const defaultRecentActivity = [
    { id: 1, name: 'Promo_Flyer.pdf', views: 243, campaign: 'Spring Launch', time: '2h ago', type: 'PDF', size: '2.4 MB', uploaded: 'Jan 3, 2026' },
    { id: 2, name: 'Menu_QR.png', views: 118, campaign: null, time: '1d ago', type: 'Image', size: '856 KB', uploaded: 'Jan 2, 2026' },
    { id: 3, name: 'Product_Video.mp4', views: 94, campaign: 'Video Ads', time: '1d ago', type: 'Video', size: '45.2 MB', uploaded: 'Jan 2, 2026' },
    { id: 4, name: 'Brand_Guidelines.pdf', views: 67, campaign: 'Brand Update', time: '2d ago', type: 'PDF', size: '5.1 MB', uploaded: 'Jan 1, 2026' },
    { id: 5, name: 'Event_Poster.jpg', views: 189, campaign: 'Spring Launch', time: '3d ago', type: 'Image', size: '3.2 MB', uploaded: 'Dec 31, 2025' },
    { id: 6, name: 'Tutorial_Audio.mp3', views: 45, campaign: null, time: '4d ago', type: 'Audio', size: '12.8 MB', uploaded: 'Dec 30, 2025' },
    { id: 7, name: 'Website_Banner.png', views: 278, campaign: 'Website Redesign', time: '5d ago', type: 'Image', size: '1.9 MB', uploaded: 'Dec 29, 2025' },
    { id: 8, name: 'Campaign_Deck.pdf', views: 156, campaign: 'Q1 Planning', time: '6d ago', type: 'PDF', size: '8.7 MB', uploaded: 'Dec 28, 2025' },
  ];

  // Load recent activity from localStorage or use defaults
  const [recentActivity, setRecentActivity] = useState(() => {
    try {
      const stored = localStorage.getItem('mediumbiz_activity');
      return stored ? JSON.parse(stored) : defaultRecentActivity;
    } catch {
      return defaultRecentActivity;
    }
  });

  // Persist recent activity to localStorage
  useEffect(() => {
    localStorage.setItem('mediumbiz_activity', JSON.stringify(recentActivity));
  }, [recentActivity]);

  // Default QR codes
  const defaultQrCodes = [
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

  // Load QR codes from localStorage or use defaults
  const [qrCodes, setQrCodes] = useState(() => {
    try {
      const stored = localStorage.getItem('mediumbiz_qrcodes');
      return stored ? JSON.parse(stored) : defaultQrCodes;
    } catch {
      return defaultQrCodes;
    }
  });

  // Save QR codes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mediumbiz_qrcodes', JSON.stringify(qrCodes));
  }, [qrCodes]);

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
          <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
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
              <button onClick={closeMobileMenu} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
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
            <NotificationsPanel dashboardType="medium-business" />
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
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                      <Upload size={18} />
                      Export CSV
                    </button>
                    <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                      <Upload size={18} />
                      Export Excel
                    </button>
                    <div className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      PDF & Custom exports in Enterprise
                    </div>
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
                <button onClick={() => setActiveTab('campaigns')} className="w-full px-6 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 flex items-center justify-center gap-2">
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
                <button onClick={() => setShowUploadModal(true)} className="flex flex-col items-center gap-2 p-4 bg-purple-50 border-2 border-purple-600 rounded-lg">
                  <Video size={28} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">VIDEO</span>
                </button>
                {uploadTypes.filter(t => t.label !== 'Videos').map((type, idx) => (
                  <button key={idx} onClick={() => setShowUploadModal(true)} className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-purple-400">
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
                  <button onClick={() => setShowUploadModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
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
                      <button onClick={() => setShowQRModal({ title: qr.name, views: qr.views, type: 'QR Code' })} className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 text-sm">
                        View QR
                      </button>
                      <button onClick={() => setActiveTab('analytics')} className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm">
                        View Analytics
                      </button>
                      <button
                        onClick={() => setShowQRModal({ title: qr.name, views: qr.views, type: 'QR Code' })}
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
                  <button onClick={() => setShowUploadModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
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
                      <button onClick={() => setActiveTab('activity')} className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 text-sm">
                        View Uploads
                      </button>
                      <button onClick={() => setActiveTab('analytics')} className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 text-sm">
                        View Analytics
                      </button>
                      <button onClick={() => setEditingCampaign(campaign)} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium hover:bg-slate-100 text-sm">
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
                  <button onClick={() => setShowInviteModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
                    <UserPlus size={20} />
                    Invite Contributor
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-6 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
                  <div>Member</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Invited</div>
                  <div>Actions</div>
                </div>
                {contributorsList.map((contributor, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 p-6 items-center hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {contributor.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{contributor.email}</p>
                        <p className="text-sm text-slate-500">{contributor.name}</p>
                      </div>
                    </div>
                    <div>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm" title={`Available roles: ${availableRoles.join(', ')}`}>
                        <span>{contributor.role}</span>
                        <ChevronDown size={14} />
                      </button>
                      <p className="text-xs text-slate-400 mt-1">Roles: {availableRoles.join(', ')}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        contributor.status === 'Accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {contributor.status === 'Accepted' ? '✓' : '⏳'} {contributor.status}
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
                    <p className="text-2xl font-bold text-slate-900">Free Plan</p>
                    <p className="text-slate-600 mt-1">250 GB storage included</p>
                  </div>
                  <button onClick={() => setShowUploadModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700">
                    Upgrade Plan
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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                    PR
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">Pablo Rivera</p>
                    <p className="text-slate-600">pablomrivera1976@gmail.com</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="text-blue-600 hover:text-blue-700 font-medium">
                  Change Photo
                </button>
              </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <p className="font-medium text-slate-900">Change Password</p>
                    <p className="text-sm text-slate-500">Update your password</p>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
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
                  <button onClick={() => window.open('https://docs.outboundimpact.net', '_blank')} className="text-blue-600 hover:text-blue-700 font-medium">
                    View Docs →
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <HelpCircle size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
                  <p className="text-slate-600 mb-4">Get help from our team</p>
                  <button onClick={() => window.open('mailto:support@outboundimpact.net', '_blank')} className="text-purple-600 hover:text-purple-700 font-medium">
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
                      {stat.subtitle && (
                        <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                      )}
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
        </div>
      </div>
      <GlobalAiChatWidget showBlinkingPrompt={true} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        campaigns={campaigns}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        onSuccess={(item) => {
          const timestamp = Date.now();
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          // Determine file type from item
          const getFileType = () => {
            if (item.type === 'text') return 'Text';
            if (item.type === 'embed') return 'Embed';
            if (item.fileType?.startsWith('image/')) return 'Image';
            if (item.fileType?.startsWith('video/')) return 'Video';
            if (item.fileType?.startsWith('audio/')) return 'Audio';
            if (item.fileType?.includes('pdf')) return 'PDF';
            return 'File';
          };

          // Add new QR code to the list
          const newQrCode = {
            id: timestamp,
            name: item.title || 'New Upload',
            location: 'Just created',
            linkedContent: item.title || 'Uploaded Content',
            views: 0,
            created: dateStr,
            lastScanned: 'Never',
            status: 'Active',
            qrCodeUrl: item.qrCodeUrl,
            viewUrl: item.viewUrl,
            isDemo: item.isDemo
          };
          setQrCodes(prev => [newQrCode, ...prev]);

          // Add to recent activity
          const newActivity = {
            id: timestamp,
            name: item.title || item.fileName || 'New Upload',
            views: 0,
            campaign: null,
            time: 'Just now',
            type: getFileType(),
            size: item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A',
            uploaded: dateStr,
            thumbnail: item.thumbnail,
            viewUrl: item.viewUrl
          };
          setRecentActivity(prev => [newActivity, ...prev]);

          setShowUploadModal(false);
          setActiveTab('activity'); // Switch to activity tab to show the new item
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
              <p className="text-sm text-slate-500 mb-4">{showQRModal.views} views - {showQRModal.type}</p>
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

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => { setShowComposeModal(false); setReplyTo(null); }}
        onMessageSent={handleMessageSent}
        dashboardType="medium"
        replyTo={replyTo}
      />

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

      {/* Invite Contributor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus size={24} />
                  <div>
                    <h2 className="text-xl font-bold">Invite Contributor</h2>
                    <p className="text-purple-100 text-sm">Add a team member to your dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Success State */}
            {inviteSent ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Invitation Sent!</h3>
                <p className="text-slate-600">
                  An email invitation has been sent to {inviteEmail}
                </p>
              </div>
            ) : (
              <>
                {/* Form */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role
                    </label>
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Role permissions:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li><strong>Admin:</strong> Full access, can manage team</li>
                      <li><strong>Manager:</strong> Create/edit content, view analytics</li>
                      <li><strong>Editor:</strong> Create/edit content only</li>
                      <li><strong>Viewer:</strong> View-only access</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-5 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteContributor}
                    disabled={inviteSending || !inviteEmail}
                    className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
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
                        <Mail size={18} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
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
    </div>
  );
}
