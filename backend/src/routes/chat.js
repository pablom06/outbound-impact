// AI Chat Routes
// Simple implementation - can be extended with actual AI integration
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
const conversations = new Map();

// Start new conversation
router.post('/conversations', (req, res) => {
  const conversationId = uuidv4();

  conversations.set(conversationId, {
    id: conversationId,
    messages: [],
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    id: conversationId,
    conversation: { id: conversationId }
  });
});

// Send message
router.post('/conversations/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content required' });
  }

  // Get or create conversation
  let conversation = conversations.get(conversationId);
  if (!conversation) {
    conversation = {
      id: conversationId,
      messages: [],
      createdAt: new Date().toISOString()
    };
    conversations.set(conversationId, conversation);
  }

  // Add user message
  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  };
  conversation.messages.push(userMessage);

  // Generate AI response (simple pattern matching for demo)
  const aiResponse = generateAIResponse(content);
  const aiMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date().toISOString()
  };
  conversation.messages.push(aiMessage);

  res.json({
    userMessage,
    aiMessage
  });
});

// Get messages
router.get('/conversations/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  const conversation = conversations.get(conversationId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(conversation.messages);
});

// Submit feedback
router.post('/messages/:messageId/feedback', (req, res) => {
  const { messageId } = req.params;
  const { isHelpful } = req.body;

  // In a real implementation, save this feedback to database
  console.log(`Feedback for message ${messageId}: ${isHelpful ? 'helpful' : 'not helpful'}`);

  res.json({ success: true });
});

// Simple AI response generator
function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes('qr code') || message.includes('qr')) {
    return "To create a QR code, go to your dashboard and click 'Upload New Content'. After uploading a file, text, or embed, a QR code will be automatically generated. You can download it as an image or share the direct link!";
  }

  if (message.includes('upload') || message.includes('file')) {
    return "You can upload files by clicking the 'Upload New Content' button on your dashboard. We support images, videos, audio files, PDFs, and text content. Each upload gets its own unique QR code!";
  }

  if (message.includes('analytics') || message.includes('views') || message.includes('stats')) {
    return "Your analytics show how many times your QR codes have been scanned. You can see total views, views per item, and more in the Analytics tab. Paid plans get access to advanced analytics with geographic data and device breakdowns.";
  }

  if (message.includes('plan') || message.includes('upgrade') || message.includes('pricing')) {
    return "We offer several plans:\n\n• Personal (Free): 3 uploads, 1GB storage\n• Small Business ($29/mo): 50 uploads, 10GB storage\n• Medium Business ($79/mo): 200 uploads, 50GB, team features\n• Enterprise ($199/mo): Unlimited uploads, 500GB, priority support\n\nGo to Settings > Current Plan to upgrade!";
  }

  if (message.includes('help') || message.includes('how')) {
    return "I can help you with:\n\n• Creating and managing QR codes\n• Uploading content (files, text, embeds)\n• Understanding your analytics\n• Account settings and billing\n• Team management (paid plans)\n\nWhat would you like to know more about?";
  }

  // Default response
  return "Thanks for your question! I'm here to help with anything related to Outbound Impact - QR codes, uploads, analytics, or account settings. Could you tell me more about what you're trying to do?";
}

module.exports = router;
