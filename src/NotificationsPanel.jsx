// NOTIFICATIONS PANEL
// Reusable notification system for all dashboards

import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Settings as SettingsIcon } from 'lucide-react';

export default function NotificationsPanel({ dashboardType = 'customer' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out our new analytics dashboard for detailed insights into your campaign performance.',
      time: '5 min ago',
      read: false,
      category: 'product_updates'
    },
    {
      id: 2,
      type: 'success',
      title: 'Campaign Sent Successfully',
      message: 'Your "Holiday Promotion" campaign was delivered to 156 contacts.',
      time: '2 hours ago',
      read: false,
      category: 'campaigns'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Approaching Plan Limit',
      message: 'You\'ve used 4 out of 5 QR codes. Consider upgrading to continue growing.',
      time: '1 day ago',
      read: true,
      category: 'limits'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    product_updates: true,
    campaigns: true,
    limits: true,
    billing: true,
    security: true,
    marketing: false
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleSetting = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-600" size={20} />;
      case 'alert': return <AlertCircle className="text-orange-600" size={20} />;
      default: return <Info className="text-blue-600" size={20} />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSettings(false);
        }}
        className="relative p-3 bg-white border-2 border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-all shadow-sm"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {showSettings ? (
              // Settings View
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      ←
                    </button>
                    <h3 className="font-bold text-slate-900">Notification Settings</h3>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto">
                  <p className="text-sm text-slate-600 mb-4">Choose which notifications you want to receive</p>

                  <div className="space-y-3">
                    {[
                      { key: 'product_updates', label: 'Product Updates', desc: 'New features and improvements' },
                      { key: 'campaigns', label: 'Campaign Alerts', desc: 'Campaign performance and status' },
                      { key: 'limits', label: 'Usage Limits', desc: 'Approaching plan limits' },
                      { key: 'billing', label: 'Billing & Payments', desc: 'Invoices and payment updates' },
                      { key: 'security', label: 'Security Alerts', desc: 'Account security notifications' },
                      { key: 'marketing', label: 'Marketing Communications', desc: 'Tips, promotions, and offers' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{label}</p>
                          <p className="text-xs text-slate-600">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key]}
                            onChange={() => toggleSetting(key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Notifications List
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <SettingsIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto text-slate-300 mb-3" size={48} />
                      <p className="text-slate-600">No notifications</p>
                      <p className="text-sm text-slate-500 mt-1">You\'re all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-purple-50/50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-semibold text-sm ${
                                  !notification.read ? 'text-slate-900' : 'text-slate-700'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-200 text-center">
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
