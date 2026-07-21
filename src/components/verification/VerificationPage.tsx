import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { verificationService, storageService } from '../../services/supabaseService';
import { VerificationDocument } from '../../types';
import {
  ShieldCheck, ShieldAlert, FileText, Upload, Loader2,
  Check, X, ArrowRight, Info,
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
  const [isUploading, setIsUploading] = useState(false);

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
  };

  const handleSubmitDoc = async () => {
    if (!user || !selectedFile) return;
    setIsUploading(true);

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
      });

      if (doc) {
        toast.success('Document uploaded & sent to Academy Panel!');
        setSelectedFile(null);
        setFileName('');
        loadData();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetUpload = () => {
    setSelectedFile(null);
    setFileName('');
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
          Document Verification Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user.role === 'player'
            ? 'Upload your identity or sports achievement documents to get your profile verified by an Academy.'
            : 'Review athlete verification requests and approve or decline uploaded documents.'}
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

            {/* Submission history */}
            {playerDocs.length > 0 && (
              <div className="mt-6 w-full border-t dark:border-gray-700 pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Past Submissions</p>
                <div className="space-y-2">
                  {playerDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300 font-semibold capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                      <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        doc.status === 'verified'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : doc.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Wizard */}
          <div className="lg:col-span-2">
            {canUpload ? (
              <div className="card-sports p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-500" />
                    Upload Athlete Documents
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    Select a document type and upload a clear scan or photo. An Academy will review it and verify your profile.
                  </p>
                </div>

                {/* Info Notice */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    Documents are reviewed manually by Academy organizations. Ensure your document is clear, unedited, and shows your full name and relevant details.
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

                    <button
                      onClick={handleSubmitDoc}
                      disabled={isUploading}
                      className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          Submit to Academy Panel <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
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
                  Document type: <strong className="capitalize">{latestDoc?.documentType?.replace('_', ' ')}</strong>
                </p>
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    Your document is pending review by an Academy. You will receive a notification once the review is complete.
                  </p>
                </div>
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
                    <h3 className="text-lg font-black text-gray-800 dark:text-white">Review Athlete Document</h3>
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

                {/* Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Document Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Player</span>
                        <span className="text-gray-800 dark:text-white font-bold">{selectedDoc.playerName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Type</span>
                        <span className="text-gray-800 dark:text-white font-bold capitalize">{selectedDoc.documentType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Submitted</span>
                        <span className="text-gray-800 dark:text-white font-bold">{new Date(selectedDoc.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Link / Preview */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center py-8">
                    {selectedDoc.fileUrl.startsWith('http') ? (
                      <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        View Uploaded Document
                      </a>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 text-blue-500 mb-2" />
                        <p className="font-bold text-sm text-gray-500 dark:text-gray-400">File path stored</p>
                      </>
                    )}
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2 block">
                      {selectedDoc.documentType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    Carefully review the uploaded document before approving. Once approved, the athlete's profile will be marked as <strong>Verified</strong> and they will be notified.
                  </p>
                </div>
              </div>
            ) : (
              <div className="card-sports p-10 text-center">
                <ShieldCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Select an applicant to review.</h3>
                <p className="text-gray-400 text-sm mt-1">Review applicant details and approve or decline their verification document.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
