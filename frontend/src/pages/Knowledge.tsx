import React, { useEffect, useRef, useState } from 'react';
import {
  deleteDocumentApi,
  getDocumentsApi,
  searchKnowledgeApi,
  uploadDocumentApi,
} from '../api/knowledge';
import { Document, RetrievedChunk } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FilePlus,
  Loader2,
} from 'lucide-react';

export const Knowledge: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File input ref for triggering upload file dialog
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(5);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<RetrievedChunk[]>([]);

  // Delete modal state
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Drag and drop state
  const [dragActive, setDragActive] = useState<boolean>(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocumentsApi();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadDocumentApi(file);
      setUploadSuccess(
        `Successfully ingested "${res.filename}" into ${res.chunk_count} vector chunks.`
      );
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const res = await searchKnowledgeApi(searchQuery, undefined, topK);
      setSearchResults(res.chunks);
    } catch (err: any) {
      setError(err.message || 'Vector search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await deleteDocumentApi(docToDelete.id);
      setDocToDelete(null);
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Global Hidden File Input */}
      <input
        ref={fileInputRef}
        id="file-input-trigger"
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Document Intelligence & RAG v0.5</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload PDFs, DOCX, TXT, and Markdown files to extract, chunk, embed, and query with semantic RAG.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents" icon={<FileText className="w-4 h-4" />}>
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="search" icon={<Search className="w-4 h-4" />}>
            Vector Search
          </TabsTrigger>
          <TabsTrigger value="upload" icon={<UploadCloud className="w-4 h-4" />}>
            Ingest Document
          </TabsTrigger>
        </TabsList>

        {/* 1. Documents Tab */}
        <TabsContent value="documents">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ingested Knowledge Documents
              </h2>
              <Button size="sm" onClick={triggerFileInput}>
                <FilePlus className="w-4 h-4" />
                <span>Upload New</span>
              </Button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading ingested documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <FileCode className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No documents ingested yet. Upload PDF, DOCX, TXT, or MD files to build your vector index.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Vector Chunks</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{doc.filename}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="indigo" size="sm">
                            {doc.file_type.toUpperCase().replace('.', '')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{formatFileSize(doc.size)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              doc.status === 'completed'
                                ? 'emerald'
                                : doc.status === 'processing'
                                ? 'amber'
                                : 'slate'
                            }
                            size="sm"
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {doc.chunk_count} chunks
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 2. Vector Search Tab */}
        <TabsContent value="search">
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Semantic Vector Search
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask a question or enter keywords to retrieve document chunks..."
                    />
                  </div>
                  <div className="w-28">
                    <select
                      value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value))}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value={3}>Top 3</option>
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                    </select>
                  </div>
                  <Button type="submit" isLoading={searching}>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results Panel */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Retrieved Chunks ({searchResults.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.map((chunk, idx) => (
                    <Card key={idx} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-900 dark:text-white">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>{chunk.metadata.filename || 'Document'}</span>
                          <span className="text-slate-400">• Page {chunk.metadata.page_number || 1}</span>
                        </div>
                        <Badge variant="emerald" size="sm">
                          Score: {(chunk.similarity_score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {chunk.text}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 3. Upload Tab */}
        <TabsContent value="upload">
          <Card className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ingest Document into ChromaDB
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supported formats: PDF (.pdf), Word (.docx), Plain Text (.txt), Markdown (.md)
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Parsing, chunking, and embedding document...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Drag & Drop files here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Target chunk size ~800 chars, overlap ~150 chars.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        title="Delete Document & Vectors"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>"{docToDelete?.filename}"</strong>? This will permanently remove the database record, local file, and ChromaDB vector embeddings.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setDocToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} isLoading={deleting}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
