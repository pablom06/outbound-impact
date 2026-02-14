// Global AI Chat Widget
// Floating chat assistant for dashboard help
// Based on: https://github.com/shakeelahmed45/outbound-impact

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, ThumbsUp, ThumbsDown, Sparkles, Bot, User } from 'lucide-react';
import { chatAPI } from '../services/api';

export default function GlobalAiChatWidget({ showBlinkingPrompt = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if user has seen welcome
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenAiWelcome');
    if (!hasSeenWelcome && showBlinkingPrompt) {
      setShowWelcome(true);
    }
  }, [showBlinkingPrompt]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize conversation when chat opens
  const initializeConversation = async () => {
    if (conversationId) return;

    try {
      const response = await chatAPI.startConversation();
      setConversationId(response.conversation?.id || response.id);

      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your Outbound Impact assistant. I can help you with:\n\n• Creating and managing QR codes\n• Uploading content\n• Understanding your analytics\n• Account settings and billing\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Use demo mode if API not available
      setConversationId('demo');
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your Outbound Impact assistant. I can help you with:\n\n• Creating and managing QR codes\n• Uploading content\n• Understanding your analytics\n• Account settings and billing\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Handle opening chat
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowWelcome(false);
    localStorage.setItem('hasSeenAiWelcome', 'true');
    initializeConversation();
  };

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    try {
      if (conversationId === 'demo') {
        // Demo mode response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const demoResponses = [
          "That's a great question! To create a QR code, go to your dashboard and click 'Upload New Content'. After uploading, a QR code will be automatically generated for your item.",
          "I can help with that! Your analytics show how many times your QR codes have been scanned. You can see views, locations, and device types in the Analytics tab.",
          "To upgrade your plan, go to Settings > Current Plan and click 'Upgrade'. You'll see all available options with their features.",
          "Each item you upload gets a unique QR code. You can download it as an image or share the direct link. The QR code works with any standard QR scanner app.",
        ];
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: randomResponse,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        const response = await chatAPI.sendMessage(conversationId, userMessage.content);

        if (response.aiMessage) {
          setMessages((prev) => [
            ...prev,
            {
              id: response.aiMessage.id || `assistant-${Date.now()}`,
              role: 'assistant',
              content: response.aiMessage.content,
              timestamp: response.aiMessage.createdAt || new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // Handle feedback
  const handleFeedback = async (messageId, isHelpful) => {
    try {
      if (conversationId !== 'demo') {
        await chatAPI.submitFeedback(messageId, isHelpful);
      }
      // Update message to show feedback was given
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedbackGiven: isHelpful ? 'helpful' : 'not_helpful' } : msg
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] animate-bounce">
          <div className="bg-white rounded-xl shadow-2xl border border-purple-200 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">Need help?</p>
                <p className="text-sm text-slate-600">
                  Click the chat button to ask me anything about Outbound Impact!
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform ${
          isOpen ? 'hidden' : ''
        } ${showBlinkingPrompt && !localStorage.getItem('hasSeenAiWelcome') ? 'animate-pulse' : ''}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-6 z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all ${
            isMinimized ? 'bottom-6 w-72 h-14' : 'bottom-6 w-96 h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">OI Assistant</p>
                {!isMinimized && (
                  <p className="text-xs text-purple-200">Always here to help</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[360px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      }`}
                    >
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {/* Feedback buttons for assistant messages */}
                      {message.role === 'assistant' && !message.isError && message.id !== 'welcome' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                          {message.feedbackGiven ? (
                            <span className="text-xs text-slate-500">
                              {message.feedbackGiven === 'helpful' ? '👍 Thanks!' : '👎 Noted'}
                            </span>
                          ) : (
                            <>
                              <span className="text-xs text-slate-500">Helpful?</span>
                              <button
                                onClick={() => handleFeedback(message.id, true)}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                <ThumbsUp size={14} className="text-slate-500" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, false)}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                <ThumbsDown size={14} className="text-slate-500" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
