import { useAction, useMutation } from 'convex/react';
import { motion } from 'motion/react';
import { Brain, Check, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { AiScoreRing } from '../components/AiScoreRing';
import { PlatformSelector } from '../components/PlatformSelector';
import { ScamTypeTag } from '../components/ScamTypeTag';
import { SeverityBadge } from '../components/SeverityBadge';
import { VoteButtons } from '../components/VoteButtons';
import type { AIAnalysisResult, Platform } from '../types';
import { severityFromThreatScore } from '../utils/threatScore';
import { prepareScreenshotForAnalysis } from '../utils/uploadScreenshot';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function PublicSubmitReport() {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStorageId, setImageStorageId] = useState<Id<'_storage'> | null>(null);
  const [imageInlineDataUrl, setImageInlineDataUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [region, setRegion] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyze = useAction(api.ai.analyze);
  const createReport = useMutation(api.reports.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const hasImage = Boolean(imageStorageId || imageInlineDataUrl);
  const hasInput = Boolean(content.trim() || hasImage);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageStorageId(null);
    setImageInlineDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('Image must be 8 MB or smaller.');
      return;
    }
    setImageUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      const prepared = await prepareScreenshotForAnalysis(file, generateUploadUrl);
      setImageStorageId(prepared.storageId ?? null);
      setImageInlineDataUrl(prepared.inlineDataUrl ?? null);
    } catch (error) {
      console.error('Image upload failed:', error);
      clearImage();
      alert('Could not upload the screenshot. Try a smaller image or different format.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInput) return;
    setLoading(true);
    setResult(null);
    setSubmittedReportId(null);
    try {
      const analysis = await analyze({
        content: content.trim() || undefined,
        imageStorageId: imageStorageId ?? undefined,
        imageDataUrl: imageInlineDataUrl ?? undefined,
        context: context || undefined,
        platform,
        region: region || undefined,
      });
      setResult(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToDatabase = async () => {
    if (!result || (!content.trim() && !hasImage)) return;

    setIsSubmitting(true);

    try {
      const reportContent =
        content.trim() ||
        (imagePreview ? '[Screenshot submitted — see community feed for details]' : '');

      const threatScore = result.threatScore;
      const severity = severityFromThreatScore(threatScore);

      const reportId = await createReport({
        content: reportContent,
        platform,
        region: region || undefined,
        scamType: result.scamType,
        severity,
        aiScore: result.aiScore,
        aiReasoning: result.reasoning,
        attackPatterns: result.attackPatterns,
        recommendations: result.recommendations,
      });
      setSubmittedReportId(reportId);
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreBreakdown = result
    ? [
        `Threat: ${result.threatScore}`,
        result.textAiScore != null ? `Text AI: ${result.textAiScore}` : null,
        result.imageAiScore != null ? `Image AI: ${result.imageAiScore}` : null,
        `Community: ${result.communityScore}`,
        `Trend: ${result.trendScore}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <motion.div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Report a Scam</h1>
        <p className="mt-2 text-text-muted">
          Paste a message, upload a screenshot, or both — AI will analyze each signal
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="card space-y-8 p-6 sm:p-8">
        <motion.div>
          <p className="section-label">What did you receive?</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Paste the suspicious message, URL, or content here (optional if you upload a screenshot)..."
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-highlight/30"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleImageSelect(e.target.files?.[0])}
          />
          {imageUploading && (
            <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Compressing and uploading screenshot…
            </p>
          )}
          {imagePreview ? (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-border">
              <img src={imagePreview} alt="Upload preview" className="max-h-64 w-full object-contain bg-gray-50" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Remove screenshot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50 py-8 text-center transition-colors hover:border-primary hover:bg-highlight/5"
            >
              <Upload className="mb-2 h-8 w-8 text-text-dim" />
              <p className="text-sm text-text-muted">Drop a screenshot here or click to upload</p>
            </button>
          )}
        </motion.div>

        <motion.div>
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
        </motion.div>

        <motion.div>
          <p className="section-label">Anything else?</p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Add context..."
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </motion.div>

        <button
          type="submit"
          disabled={loading || imageUploading || !hasInput}
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
            <AiScoreRing score={result.threatScore} />
            <div className="flex-1 text-center sm:text-left">
              <motion.div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <SeverityBadge severity={severityFromThreatScore(result.threatScore)} solid />
                <ScamTypeTag type={result.scamType} />
              </motion.div>
              <p className="mt-4 text-sm text-text-muted">{result.reasoning}</p>
              <p className="mt-2 text-xs text-text-dim">Score breakdown — {scoreBreakdown}</p>
            </div>
          </motion.div>
          <div className="mt-6">
            <p className="section-label">Attack patterns</p>
            <motion.div className="mt-2 flex flex-wrap gap-2">
              {result.attackPatterns.map((p) => (
                <span key={p} className="rounded-full border border-border bg-gray-50 px-3 py-1 text-xs">
                  {p}
                </span>
              ))}
            </motion.div>
          </div>
          <ul className="mt-6 space-y-2">
            {result.recommendations.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {r}
              </li>
            ))}
          </ul>

          {!submittedReportId ? (
            <button
              type="button"
              onClick={handleSubmitToDatabase}
              disabled={isSubmitting}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-base font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Confirm & Submit to Crowdshield
                </>
              )}
            </button>
          ) : (
            <p className="mt-8 text-center text-sm font-medium text-accent">Report saved to the live feed.</p>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <VoteButtons reportId={submittedReportId ?? 'new'} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
