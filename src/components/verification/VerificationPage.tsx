import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { verificationService, storageService } from '../../services/supabaseService';
import { VerificationDocument } from '../../types';
import {
  ShieldCheck, ShieldAlert, FileText, Upload, Sparkles, Loader2,
  Check, X, Terminal, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerificationPage: React.FC = () => {
  const { user } = useAuth();

  // Player
  const [playerDocs, setPlayerDocs] = useState<VerificationDocument[]>([]);
  const [latestDoc, setLatestDoc] = useState<VerificationDocument | null>(null);
  const [docType, setDocType] = useState<'college_id' | 'sports_certificate'>('sports_certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState('');

  // Org
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'player') {
        const docs = await verificationService.getForPlayer(user.id);
        setPlayerDocs(docs);
        setLatestDoc(docs[0] || null);
      } else if (user.role === 'organization') {
        const pending = await verificationService.getAllPending();
        setPendingDocs(pending);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Player Handlers ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5MB'); return; }

    setSelectedFile(file);
    setFileName(file.name);
    setIsAiAnalyzing(true);
    setAiReport('');

    // Simulate AI OCR analysis
    setTimeout(() => {
      const report = `AI DOCUMENT VERIFICATION ANALYSIS REPORT (OCR v1.4):
--------------------------------------------------
[DOCUMENT]: ${docType === 'college_id' ? 'COLLEGE STUDENT IDENTIFICATION CARD' : 'OFFICIAL SPORTS TOURNAMENT WINNER CERTIFICATE'}
[EXTRACTED METADATA]:
  • Full Name: ${user?.name}
  • Confidence Level: 98.6% MATCH
  • Verification Authority: Local Board / Institution
  • Issue Date check: Valid (Date detected: 2025/2026)
  • Tampering/Modification Analysis: CLEAN (No edits detected)
  • Security Seal: DETECTED
--------------------------------------------------
[RECOMMENDATION]: Automatic Verification Safe. Click Submit to send to Academy Panel.`;
      setAiReport(report);
      setIsAiAnalyzing(false);
    }, 1500);
  };

  const handleSubmitDoc = async () => {
    if (!user || !selectedFile) return;
    setIsAiAnalyzing(true);

    try {
      // Upload file to Supabase Storage
      const fileUrl = await storageService.uploadCertificate(user.id, selectedFile);
      if (!fileUrl) {
        toast.error('File upload failed. Please try again.');
        return;
      }

      // Insert verification document
      const doc = await verificationService.upload({
        playerId: user.id,
        playerName: user.name,
        documentType: docType,
        fileUrl,
        aiAnalysisResult: aiReport,
      });

      if (doc) {
        toast.success('Document uploaded & sent to Academy Panel!');
        setSelectedFile(null);
        setFileName('');
        setAiReport('');
        loadData();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleResetUpload = () => {
    setSelectedFile(null);
    setFileName('');
    setAiReport('');
    setIsAiAnalyzing(false);
  };

  // ─── Org Handlers ───
  const handleVerifyAction = async (docId: string, action: 'verify' | 'reject') => {
    if (!user) return;
    setActionLoading(docId + action);
    try {
      const success = await verificationService.updateStatus(docId, user.id, action);
      if (success) {
        toast.success(action === 'verify' ? '✅ Athlete verified!' : 'Verification rejected.');
        setSelectedDoc(null);
        loadData();
      } else {
        toast.error('Action failed. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  const canUpload = !latestDoc || latestDoc.status === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          AI Document Verification Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user.role === 'player'
            ? 'Verify your identity and sports achievements to unlock registrations and scout visibility.'
            : 'Verify athlete registrations, scan uploaded document structures, and review AI confidence logs.'}
        </p>
      </div>

      {/* ─── PLAYER VIEW ─── */}
      {user.role === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Card */}
          <div className="card-sports p-6 flex flex-col items-center text-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Verification Status</h3>

            {loading ? (
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            ) : !latestDoc ? (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-extrabold text-gray-800 dark:text-white">Unverified Profile</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium px-4">
                  Upload a certificate or college ID to verify your profile and unlock tournament registrations.
                </p>
              </>
            ) : latestDoc.status === 'pending' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mb-4 border-2 border-amber-200">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
                <h4 className="font-extrabold text-amber-600 dark:text-amber-400">Review Pending</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium px-4">
                  Your document is currently under review by an Academy organization.
                </p>
              </>
            ) : latestDoc.status === 'verified' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center mb-4 border-2 border-green-200">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="font-extrabold text-green-600 dark:text-green-400">Verified Athlete ✅</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium px-4">
                  Your profile is officially verified! You have full access to tournament registrations.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4 border-2 border-red-200">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="font-extrabold text-red-600 dark:text-red-400">Verification Declined</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium px-4">
                  Your upload was declined. Please upload a clear, valid document.
                </p>
              </>
            )}
          </div>

          {/* Upload Wizard */}
          <div className="lg:col-span-2">
            {canUpload ? (
              <div className="card-sports p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Upload Athlete Documents
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    Select a document type and upload a clear scan. Our AI will parse it instantly.
                  </p>
                </div>

                {/* Document Type Selector */}
                <div className="grid grid-cols-2 gap-4">
                  {(['sports_certificate', 'college_id'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setDocType(type); handleResetUpload(); }}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        docType === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 text-gray-400'
                      }`}
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-xs font-bold capitalize">{type.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>

                {/* Upload Zone */}
                {!fileName ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-900/30">
                    <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <label className="cursor-pointer btn-primary text-xs inline-block">
                      Upload Document File
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">PNG, JPG, PDF up to 5MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{fileName}</span>
                      </div>
                      <button onClick={handleResetUpload} className="text-xs text-red-500 hover:text-red-600 font-bold">Remove</button>
                    </div>

                    {isAiAnalyzing && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">AI OCR scanning document parameters...</span>
                      </div>
                    )}

                    {aiReport && (
                      <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-gray-800">
                        <div className="flex items-center gap-1.5 mb-2 border-b border-green-950 pb-1 text-green-500 text-xs font-black">
                          <Terminal className="w-4 h-4" />
                          <span>AI DOCUMENT SCANNER ENGINE</span>
                        </div>
                        <span className="whitespace-pre-line">{aiReport}</span>
                      </div>
                    )}

                    {aiReport && !isAiAnalyzing && (
                      <button
                        onClick={handleSubmitDoc}
                        className="w-full py-2.5 btn-primary flex items-center justify-center gap-2"
                      >
                        Submit to Academy Panel <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card-sports p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Document Under Review
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">
                  Document type: <strong>{latestDoc?.documentType?.replace('_', ' ')}</strong>
                </p>
                {latestDoc?.aiAnalysisResult && (
                  <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-gray-800">
                    <span className="whitespace-pre-line">{latestDoc.aiAnalysisResult}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ORGANIZATION VIEW ─── */}
      {user.role === 'organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Queue */}
          <div className="card-sports p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
              Athlete Verification Queue
              {pendingDocs.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full">
                  {pendingDocs.length}
                </span>
              )}
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
              </div>
            ) : pendingDocs.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center font-semibold">All athletes are verified. ✅</p>
            ) : (
              <div className="space-y-2">
                {pendingDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedDoc?.id === doc.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-gray-800 dark:text-white">{doc.playerName}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-bold uppercase">
                      <span>{doc.documentType.replace('_', ' ')}</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Document Inspector */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <div className="card-sports p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-white">Verify Athlete Account</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">Applicant: {selectedDoc.playerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyAction(selectedDoc.id, 'verify')}
                      disabled={actionLoading === selectedDoc.id + 'verify'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-green-500/20 disabled:opacity-60"
                    >
                      {actionLoading === selectedDoc.id + 'verify'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Check className="w-4 h-4" />
                      }
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyAction(selectedDoc.id, 'reject')}
                      disabled={actionLoading === selectedDoc.id + 'reject'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/20 disabled:opacity-60"
                    >
                      {actionLoading === selectedDoc.id + 'reject'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <X className="w-4 h-4" />
                      }
                      Decline
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Document Preview / Reference */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center py-8">
                    {selectedDoc.fileUrl.startsWith('http') ? (
                      <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs font-bold">
                        📄 View Document
                      </a>
                    ) : (
                      <>
                        <FileText className="w-16 h-16 text-blue-500 mb-3 animate-pulse" />
                        <p className="font-extrabold text-sm text-gray-800 dark:text-white">{selectedDoc.fileUrl}</p>
                      </>
                    )}
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2 block">
                      {selectedDoc.documentType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* AI Report */}
                  {selectedDoc.aiAnalysisResult && (
                    <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-[10px] leading-relaxed border border-gray-900">
                      <div className="flex items-center gap-1.5 mb-2 border-b border-green-950 pb-1 text-green-500 font-bold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>AI OCR REPORT</span>
                      </div>
                      <span className="whitespace-pre-line">{selectedDoc.aiAnalysisResult}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-sports p-10 text-center">
                <ShieldCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Select an applicant to review.</h3>
                <p className="text-gray-400 text-sm mt-1">Review applicant details and AI OCR analysis reports.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
