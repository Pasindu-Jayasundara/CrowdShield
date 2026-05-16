import { motion } from 'motion/react';
import { Brain, Check, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { AiScoreRing } from '../components/AiScoreRing';
import { PlatformSelector } from '../components/PlatformSelector';
import { ScamTypeTag } from '../components/ScamTypeTag';
import { SeverityBadge } from '../components/SeverityBadge';
import { VoteButtons } from '../components/VoteButtons';
import { mockAIAnalysis } from '../data/mockData';
import type { AIAnalysisResult, Platform } from '../types';

export function PublicSubmitReport() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [region, setRegion] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    const analysis = await mockAIAnalysis(content);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Report a Scam</h1>
        <p className="mt-2 text-text-muted">Help protect the community by reporting suspicious messages</p>
      </div>

      <form onSubmit={handleAnalyze} className="card space-y-8 p-6 sm:p-8">
        <div>
          <p className="section-label">What did you receive?</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Paste the suspicious message, URL, or content here..."
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-highlight/30"
            required
          />
          <div className="mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50 py-8 text-center">
            <Upload className="mb-2 h-8 w-8 text-text-dim" />
            <p className="text-sm text-text-muted">Drop a screenshot here or click to upload</p>
          </div>
        </div>

        <div>
          <p className="section-label">Where did you receive this?</p>
          <div className="mt-3">
            <PlatformSelector value={platform} onChange={setPlatform} />
          </div>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Your region / city (optional)"
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <p className="section-label">Anything else?</p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Add context..."
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3.5 text-base font-semibold disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              Analyze with AI →
            </>
          )}
        </button>
      </form>

      {result && (
        <motion.div className="card mt-8 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <AiScoreRing score={result.threatScore} severity={result.severity} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <SeverityBadge severity={result.severity} solid />
                <ScamTypeTag type={result.scamType} />
              </div>
              <p className="mt-4 text-sm text-text-muted">{result.reasoning}</p>
            </div>
          </motion.div>
          <motion.div className="mt-6">
            <p className="section-label">Attack patterns</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.attackPatterns.map((p) => (
                <span key={p} className="rounded-full border border-border bg-gray-50 px-3 py-1 text-xs">
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
          <ul className="mt-6 space-y-2">
            {result.recommendations.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-accent">
            <Check className="h-4 w-4" />
            Added to live feed
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <VoteButtons reportId="new" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
