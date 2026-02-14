// COMPOSE MESSAGE MODAL
// Modal for sending internal team messages and external emails
// Used by Small, Medium, and Enterprise dashboards

import React, { useState } from 'react';
import { X, Send, Users, Mail, Paperclip, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';

export default function ComposeMessageModal({ isOpen, onClose, onMessageSent, dashboardType = 'medium', replyTo = null }) {
  const [messageType, setMessageType] = useState('internal'); // 'internal' or 'external'
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [responseMode, setResponseMode] = useState(null); // 'live' or 'demo'

  // Handle replyTo prefill
  React.useEffect(() => {
    if (replyTo && isOpen) {
      setTo(replyTo.to || '');
      setSubject(replyTo.subject || '');
      // Determine message type based on email format
      const isEmail = replyTo.to && replyTo.to.includes('@') && !replyTo.to.includes('@company.com');
      setMessageType(isEmail ? 'external' : 'internal');
    }
  }, [replyTo, isOpen]);

  // Demo team members for internal messages
  const teamMembers = [
    { id: 1, name: 'Pablo Rivera', email: 'pablo@company.com', role: 'Owner' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Manager' },
    { id: 3, name: 'Mike Chen', email: 'mike@company.com', role: 'Team Member' },
    { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'Team Member' },
  ];

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    setError('');

    try {
      const endpoint = messageType === 'internal'
        ? `${API_BASE_URL}/messages/internal`
        : `${API_BASE_URL}/messages/external`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, include auth token here
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to, subject, body })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Check if it was sent in demo mode or live mode
      setResponseMode(data.mode || 'demo');
      setSent(true);

      // Notify parent about the sent message so it can update the UI
      if (onMessageSent) {
        onMessageSent({
          id: data.message?.id || Date.now().toString(),
          type: messageType,
          from: 'You',
          to,
          subject,
          body,
          preview: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
          time: 'Just now',
          unread: false,
          status: data.mode === 'live' ? 'Delivered' : 'Sent'
        });
      }

      // Reset after showing success
      setTimeout(() => {
        setSent(false);
        setTo('');
        setSubject('');
        setBody('');
        setResponseMode(null);
        onClose();
      }, 2500);

    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Compose Message</h2>
            <p className="text-purple-100 text-sm">Send internal or external messages</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {sent && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {responseMode === 'live' ? 'Email Sent!' : 'Message Sent!'}
            </h3>
            <p className="text-slate-600">
              {messageType === 'internal'
                ? 'Your team message has been delivered.'
                : responseMode === 'live'
                  ? `Your email has been sent to ${to}`
                  : 'Message recorded (SendGrid not configured - email simulated)'}
            </p>
            {responseMode === 'live' && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                <CheckCircle size={14} />
                Delivered via SendGrid
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && !sent && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Failed to send</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!sent && (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Message Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMessageType('internal'); setTo(''); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  messageType === 'internal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users size={18} />
                Internal Team
              </button>
              <button
                onClick={() => { setMessageType('external'); setTo(''); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  messageType === 'external'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail size={18} />
                External Email
              </button>
            </div>

            {/* To Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To {messageType === 'internal' ? '(Team Member)' : '(Email Address)'}
              </label>
              {messageType === 'internal' ? (
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.email}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                  <option value="all">All Team Members</option>
                </select>
              ) : (
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Subject Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Body Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Info Notice */}
            {messageType === 'external' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>External Email:</strong> Emails are sent via SendGrid with your address as reply-to.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Fixed Footer */}
        {!sent && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <button
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Paperclip size={18} />
              Attach
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !to || !subject || !body}
                className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  sending || !to || !subject || !body
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : messageType === 'internal'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send {messageType === 'internal' ? 'Message' : 'Email'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
