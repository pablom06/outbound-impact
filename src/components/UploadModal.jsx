// Upload Modal Component
// Allows users to upload content and generate QR codes
// Supports: Images, Videos, Audio, Text, and Embeds

import React, { useState, useRef } from 'react';
import {
  X, Upload, FileText, Link, Image, Video, Music,
  CheckCircle, AlertCircle, Loader2, QrCode, Edit2
} from 'lucide-react';
import { uploadAPI, campaignsAPI } from '../services/api';
import MediaEditor from './MediaEditor';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('file');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdItem, setCreatedItem] = useState(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [trimMetadata, setTrimMetadata] = useState(null);

  // Text post state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  // Embed state
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTrimMetadata(null); // Reset any previous edits
      setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for title

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // Create video thumbnail
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadeddata = () => {
          video.currentTime = 1; // Seek to 1 second for thumbnail
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          setFilePreview(canvas.toDataURL('image/jpeg'));
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => {
          setFilePreview(null);
        };
        video.src = URL.createObjectURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const getFileIcon = (file) => {
    if (!file) return Upload;
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if file can be edited (image, video, or audio)
  const isEditableFile = (file) => {
    if (!file) return false;
    const type = file.type.split('/')[0];
    return ['image', 'video', 'audio'].includes(type);
  };

  // Handle save from MediaEditor
  const handleMediaEditorSave = (editedFile, editedPreview, metadata = null) => {
    setSelectedFile(editedFile);
    if (editedPreview) setFilePreview(editedPreview);
    if (metadata) setTrimMetadata(metadata);
    setIsEditing(false);
  };

  // Demo mode - simulates upload when backend is unavailable
  const simulateDemoUpload = async (itemData) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    // Generate a demo QR code ID
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slug = itemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);

    return {
      id: demoId,
      slug: slug,
      title: itemData.title,
      description: itemData.description || '',
      type: itemData.type,
      fileName: selectedFile?.name || itemData.title,
      fileSize: selectedFile?.size || 0,
      fileType: selectedFile?.type || '',
      thumbnail: filePreview,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://outboundimpact.net/view/${slug}`,
      viewUrl: `https://outboundimpact.net/view/${slug}`,
      createdAt: new Date().toISOString(),
      views: 0,
      isDemo: true
    };
  };

  const handleUpload = async () => {
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      let result;
      let itemData;

      if (activeTab === 'file') {
        if (!selectedFile) {
          throw new Error('Please select a file to upload');
        }
        itemData = {
          title: title || selectedFile.name,
          description,
          type: selectedFile.type.split('/')[0] || 'file'
        };
      } else if (activeTab === 'text') {
        if (!textTitle.trim() || !textContent.trim()) {
          throw new Error('Please enter a title and content');
        }
        itemData = {
          title: textTitle,
          description,
          type: 'text'
        };
      } else if (activeTab === 'embed') {
        if (!embedUrl.trim()) {
          throw new Error('Please enter a URL to embed');
        }
        itemData = {
          title: embedTitle || 'Embedded Content',
          description,
          type: 'embed'
        };
      }

      // Try real API first, fall back to demo mode
      try {
        if (activeTab === 'file') {
          result = await uploadAPI.uploadFile(
            selectedFile,
            {
              title: title || selectedFile.name,
              description,
            },
            (percent, loaded, total) => {
              setUploadProgress(percent);
            }
          );
        } else if (activeTab === 'text') {
          result = await uploadAPI.createTextPost({
            title: textTitle,
            content: textContent,
            description,
          });
        } else if (activeTab === 'embed') {
          result = await uploadAPI.createEmbedPost({
            title: embedTitle || 'Embedded Content',
            url: embedUrl,
            description,
          });
        }
      } catch (apiError) {
        // Backend not available - use demo mode
        console.log('Backend unavailable, using demo mode:', apiError.message);
        result = await simulateDemoUpload(itemData);
      }

      setCreatedItem(result);
      setSuccess(true);

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setActiveTab('file');
    setSelectedFile(null);
    setFilePreview(null);
    setTextTitle('');
    setTextContent('');
    setEmbedUrl('');
    setEmbedTitle('');
    setTitle('');
    setDescription('');
    setError('');
    setSuccess(false);
    setCreatedItem(null);
    setUploadProgress(0);
    setIsEditing(false);
    setTrimMetadata(null);
    onClose();
  };

  const detectEmbedPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('spotify.com')) return 'Spotify';
    if (url.includes('soundcloud.com')) return 'SoundCloud';
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('docs.google.com')) return 'Google Docs';
    return 'External Link';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden transition-all ${isEditing ? 'max-w-2xl' : 'max-w-lg'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {success ? 'Upload Complete!' : isEditing ? 'Edit Media' : 'Upload Content'}
              </h2>
              <p className="text-purple-200 text-sm mt-1">
                {success
                  ? 'Your QR code is ready to share'
                  : isEditing
                  ? 'Adjust your media before uploading'
                  : 'Add content to generate a QR code'
                }
              </p>
            </div>
            <button
              onClick={isEditing ? () => setIsEditing(false) : handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto ${isEditing ? 'max-h-[75vh]' : 'max-h-[60vh]'}`}>
          {isEditing && selectedFile ? (
            // Media Editor View
            <MediaEditor
              file={selectedFile}
              preview={filePreview}
              onSave={handleMediaEditorSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : success ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Content Uploaded Successfully!
              </h3>
              <p className="text-slate-600 mb-4">
                Your QR code has been generated and is ready to share.
              </p>

              {/* Demo Mode Indicator */}
              {createdItem?.isDemo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
                  <p className="text-amber-800 text-sm font-medium">Demo Mode</p>
                  <p className="text-amber-700 text-xs">
                    Backend not connected. This is a simulated upload for testing the UI.
                  </p>
                </div>
              )}

              {/* QR Code Preview */}
              <div className="bg-slate-100 rounded-xl p-6 mb-6 inline-block">
                {createdItem?.qrCodeUrl ? (
                  <img
                    src={createdItem.qrCodeUrl}
                    alt="QR Code"
                    className="w-40 h-40 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <QrCode size={64} className="text-purple-600" />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-700 mt-3">{createdItem?.title}</p>
                {createdItem?.viewUrl && (
                  <a
                    href={createdItem.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline block mt-1"
                  >
                    {createdItem.viewUrl}
                  </a>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setCreatedItem(null);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                >
                  Upload Another
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'file', label: 'File', icon: Upload },
                  { id: 'text', label: 'Text', icon: FileText },
                  { id: 'embed', label: 'Embed', icon: Link },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* File Upload Tab */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  {/* Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      selectedFile
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    {selectedFile ? (
                      <div>
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            {React.createElement(getFileIcon(selectedFile), {
                              size: 32,
                              className: 'text-purple-600',
                            })}
                          </div>
                        )}
                        <p className="font-medium text-slate-900">{selectedFile.name}</p>
                        <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                        {trimMetadata && (
                          <p className="text-xs text-green-600 mt-1">Edited - Ready to upload</p>
                        )}
                        <div className="flex items-center justify-center gap-3 mt-2">
                          {isEditableFile(selectedFile) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                              }}
                              className="text-purple-600 text-sm hover:underline flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setFilePreview(null);
                              setTrimMetadata(null);
                            }}
                            className="text-purple-600 text-sm hover:underline"
                          >
                            Choose different file
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} className="mx-auto text-slate-400 mb-3" />
                        <p className="font-medium text-slate-900">Click to upload</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Images, videos, audio, or documents
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Max 500MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your content a title"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Text Post Tab */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="Enter a title for your text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Write your content here..."
                      rows={6}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Embed Tab */}
              {activeTab === 'embed' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL to Embed *
                    </label>
                    <input
                      type="url"
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {embedUrl && (
                      <p className="text-sm text-purple-600 mt-2">
                        Detected: {detectEmbedPlatform(embedUrl)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      placeholder="Give your embed a title"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Supported Platforms */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Supported Platforms:</p>
                    <div className="flex flex-wrap gap-2">
                      {['YouTube', 'Vimeo', 'Spotify', 'SoundCloud', 'Google Drive', 'Google Docs'].map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description (Common) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Uploading...</span>
                    <span className="text-sm text-slate-500">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && !isEditing && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload & Generate QR
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
