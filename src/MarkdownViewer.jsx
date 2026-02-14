// MARKDOWN VIEWER COMPONENT
// Displays markdown documentation files

import { useEffect, useState } from 'react';
import { FileText, Download, Home } from 'lucide-react';

export default function MarkdownViewer({ filePath, title }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        setContent(`# Error Loading Documentation\n\nCould not load file: ${filePath}\n\nError: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filePath]);

  // Simple markdown to HTML converter (basic support)
  const renderMarkdown = (text) => {
    if (!text) return '';

    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-slate-900 mt-10 mb-6">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4"><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`(.+?)`/g, '<code class="bg-slate-100 text-purple-600 px-2 py-1 rounded font-mono text-sm">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 hover:text-purple-700 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 list-disc text-slate-700 leading-relaxed">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-6 list-disc text-slate-700 leading-relaxed">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 list-decimal text-slate-700 leading-relaxed">$1</li>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-t-2 border-slate-200 my-8" />');

    // Line breaks (convert double newlines to paragraphs)
    const lines = html.split('\n');
    const paragraphs = [];
    let currentPara = [];

    lines.forEach(line => {
      if (line.trim() === '') {
        if (currentPara.length > 0) {
          paragraphs.push(currentPara.join('\n'));
          currentPara = [];
        }
      } else {
        currentPara.push(line);
      }
    });

    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join('\n'));
    }

    html = paragraphs.map(para => {
      // Don't wrap if already has HTML tags
      if (para.trim().startsWith('<')) {
        return para;
      }
      return `<p class="text-slate-700 leading-relaxed mb-4">${para}</p>`;
    }).join('\n');

    return html;
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/\s+/g, '_') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 sticky top-0 z-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <FileText size={48} />
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-purple-100">Documentation</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition inline-flex items-center gap-2"
            >
              <Download size={18} />
              Download MD
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 md:p-12 shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 mt-4">Loading documentation...</p>
            </div>
          ) : (
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>

        {/* Navigation Help */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Use the switcher in the top-right to view other dashboards, pages, or documentation.</p>
        </div>
      </div>
    </div>
  );
}
