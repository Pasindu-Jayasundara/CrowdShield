import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Plus, Shield, Globe } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { SeverityBadge } from '../../components/SeverityBadge';
import type { Id } from '../../../../convex/_generated/dataModel';

type Status = 'pending' | 'verified' | 'rejected' | 'removed';

export function AdminReports() {
  const reports = useQuery(api.reports.get);
  const updateStatus = useMutation(api.reports.updateStatus);
  const removeReport = useMutation(api.reports.remove);
  const createReport = useMutation(api.reports.createReport);

  const [activeTab, setActiveTab] = useState<Status | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredReports = reports?.filter(r =>
    activeTab === 'all' ? r.status !== 'removed' && r.status !== 'rejected' : r.status === activeTab
  );

  const handleStatusUpdate = async (id: Id<"reports">, status: Status) => {
    try {
      await updateStatus({ id, status });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleRemove = async (id: Id<"reports">) => {
    if (confirm("Are you sure you want to delete this report permanently?")) {
      try {
        await removeReport({ id });
      } catch (error) {
        console.error("Failed to remove report:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Report Moderation
          </h1>
          <p className="text-text-muted mt-1">Manage and verify community security submissions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Report
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit mb-6 overflow-x-auto">
        {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab
              ? 'bg-accent text-white shadow-md'
              : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>


      {/* Reports List */}
      <div className="grid gap-4">
        {reports === undefined ? (
          // Loading State
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-6 w-1/4 bg-white/10 rounded mb-4" />
              <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
            </div>
          ))
        ) : filteredReports?.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-text-dim" />
            </div>
            <p className="text-text-muted">No reports found in this category.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReports?.map((report) => (
              <motion.div
                key={report._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass rounded-2xl p-5 border transition-colors ${report.status === 'verified' ? 'border-accent/20' : 'border-white/5'
                  }`}

              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-3">
                      <SeverityBadge severity={report.severity} />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.status === 'verified' ? 'bg-accent/20 text-accent' : report.status === 'rejected' ? 'bg-critical/20 text-critical' : 'bg-white/10 text-text-muted'
                        }`}>

                        {report.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-text-dim flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {report.platform}
                        {report.region && ` • ${report.region}`}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{report.scamType}</h3>
                    <div className="flex gap-4 items-start mb-4">
                      <p className="text-text-muted text-sm leading-relaxed flex-1">
                        {report.content}
                      </p>
                      {report.imageUrl && (
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-white/10 shrink-0">
                          <img src={report.imageUrl} alt="Scam" className="w-full h-full object-cover cursor-zoom-in" onClick={() => window.open(report.imageUrl as string, '_blank')} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center text-xs">
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-text-dim block mb-1 uppercase tracking-tighter font-bold opacity-50">AI Trust Score</span>
                        <span className="text-accent font-mono text-sm">{report.aiScore}%</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-text-dim block mb-1 uppercase tracking-tighter font-bold opacity-50">AI Reasoning</span>
                        <p className="text-text-muted italic">"{report.aiReasoning}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {report.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'verified')}
                          className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent text-accent hover:text-white px-4 py-2 rounded-xl transition-all text-sm font-medium"
                        >
                          <Check className="h-4 w-4" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'rejected')}
                          className="flex items-center justify-center gap-2 bg-critical/10 hover:bg-critical text-critical hover:text-white px-4 py-2 rounded-xl transition-all text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {report.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(report._id, 'pending')}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-text-muted px-4 py-2 rounded-xl transition-all text-sm font-medium"
                      >
                        Reset to Pending
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(report._id)}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-critical/20 text-text-dim hover:text-critical px-4 py-2 rounded-xl transition-all text-sm font-medium mt-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateReportModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={async (data) => {
              await createReport(data);
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateReportModal({ onClose, onCreate }: { onClose: () => void, onCreate: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    content: '',
    platform: 'whatsapp',
    scamType: 'Phishing',
    severity: 'MEDIUM',
    region: 'Global',
    aiScore: 85,
    aiReasoning: 'Manual admin entry',
    attackPatterns: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass w-full max-w-lg rounded-3xl p-8 relative z-10 border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Security Report</h2>
          <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dim mb-1">Scam Type</label>
            <input
              type="text"
              required
              value={formData.scamType}
              onChange={e => setFormData({ ...formData, scamType: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent outline-none transition-all"
              placeholder="e.g. WhatsApp Phishing"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent outline-none transition-all"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent outline-none transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dim mb-1">Content / Description</label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent outline-none transition-all min-h-[100px]"
              placeholder="Describe the scam details..."
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Submit Report'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

