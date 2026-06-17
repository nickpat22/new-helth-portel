import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Eye, Download, Trash2, FileImage, FileSpreadsheet, Shield } from 'lucide-react';

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  category: string;
  description: string;
}

const mockDocs: UploadedDoc[] = [
  { id: 'DOC-001', name: 'Aadhar_Card_Front.pdf', type: 'PDF', size: '1.2 MB', date: '2024-12-10', status: 'completed', category: 'Identity Proof', description: 'Government ID for verification' },
  { id: 'DOC-002', name: 'Previous_Medical_History.pdf', type: 'PDF', size: '3.4 MB', date: '2024-12-08', status: 'completed', category: 'Medical History', description: 'Past treatment records from previous hospital' },
  { id: 'DOC-003', name: 'Insurance_Policy.pdf', type: 'PDF', size: '2.1 MB', date: '2024-12-05', status: 'completed', category: 'Insurance', description: 'Health insurance policy document' },
  { id: 'DOC-004', name: 'Vaccination_Record.jpg', type: 'Image', size: '856 KB', date: '2024-12-01', status: 'completed', category: 'Vaccination', description: 'COVID-19 and other vaccination records' },
];

const DocumentUpload: React.FC = () => {
  const [docs, setDocs] = useState<UploadedDoc[]>(mockDocs);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Medical History');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Medical History', 'Identity Proof', 'Insurance', 'Vaccination', 'Lab Report', 'Prescription', 'Other'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setShowUploadModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setShowUploadModal(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      const newDoc: UploadedDoc = {
        id: `DOC-${String(docs.length + 1).padStart(3, '0')}`,
        name: selectedFile.name,
        type: selectedFile.type.includes('image') ? 'Image' : selectedFile.type.includes('pdf') ? 'PDF' : 'Document',
        size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        category,
        description: description || 'No description provided',
      };
      setDocs([newDoc, ...docs]);
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null);
      setDescription('');
      setCategory('Medical History');
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'Image': return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'Spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Medical History': return 'bg-blue-100 text-blue-700';
      case 'Identity Proof': return 'bg-amber-100 text-amber-700';
      case 'Insurance': return 'bg-emerald-100 text-emerald-700';
      case 'Vaccination': return 'bg-violet-100 text-violet-700';
      case 'Lab Report': return 'bg-cyan-100 text-cyan-700';
      case 'Prescription': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
          <p className="text-slate-500 mt-1">Upload and manage your medical documents securely</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
          <Shield className="w-3.5 h-3.5" />
          <span>AES-256 Encrypted Storage</span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Upload Your Documents</h3>
        <p className="text-sm text-slate-500 mt-1">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-slate-400 mt-2">Supported: PDF, JPG, PNG, DOC (Max 10MB)</p>
      </div>

      {/* Document List */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Uploaded Documents ({docs.length})</h3>
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.name}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Uploaded: {doc.date}</span>
                      <span>•</span>
                      <span className="font-mono">{doc.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.type.includes('image') ? 'Image' : 'PDF')}
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{((selectedFile.size / 1024 / 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this document..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
