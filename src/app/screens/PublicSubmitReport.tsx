import { motion, AnimatePresence } from 'motion/react';
import { Brain, Check, Loader2, Upload, MapPin, X, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AiScoreRing } from '../components/AiScoreRing';
import { PlatformSelector } from '../components/PlatformSelector';
import { ScamTypeTag } from '../components/ScamTypeTag';
import { SeverityBadge } from '../components/SeverityBadge';
import { VoteButtons } from '../components/VoteButtons';
import { mockAIAnalysis } from '../data/mockData';
import type { AIAnalysisResult, Platform } from '../types';

export function PublicSubmitReport() {
  const createReport = useMutation(api.reports.createReport);
  const generateUploadUrl = useMutation(api.reports.generateUploadUrl);

  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [region, setRegion] = useState('');
  const [context, setContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;
    setLoading(true);
    setResult(null);
    setSubmitted(false);

    try {
      let imageStorageId = undefined;

      // 1. Handle Image Upload if exists
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      // 2. Simulate AI Analysis (for prototype)
      // If content is empty but image is present, we'd normally use OCR. 
      // For now, we use a default text if empty.
      const analysisContent = content || "Screenshot analysis request";
      const analysis = await mockAIAnalysis(analysisContent);
      setResult(analysis);

      // 3. Save to Convex
      await createReport({
        content: analysisContent,
        platform,
        region: region || "Unknown",
        scamType: analysis.scamType,
        severity: analysis.severity,
        aiScore: analysis.threatScore,
        aiReasoning: analysis.reasoning,
        attackPatterns: analysis.attackPatterns,
        recommendations: analysis.recommendations,
        imageStorageId,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to process report:", err);
    }

    setLoading(false);
  };

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegion(value);
    fetchSuggestions(value);
  };

  const selectSuggestion = (s: any) => {
    const name = s.address.city || s.address.town || s.address.state || s.address.suburb || s.display_name.split(',')[0];
    setRegion(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          const regionName = data.address.city || data.address.town || data.address.state || data.address.suburb;
          setRegion(regionName || '');
        } catch (err) {
          console.error("Geocoding failed", err);
        } finally {
          setLocating(false);
        }
      }, () => setLocating(false));
    } else {
      setLocating(false);
    }
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
            required={!selectedImage}
          />
          
          <div className="mt-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50 py-8 text-center hover:bg-gray-100 transition-colors"
              >
                <Upload className="mb-2 h-8 w-8 text-text-dim" />
                <p className="text-sm text-text-muted">Drop a screenshot here or click to upload</p>
              </div>
            ) : (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="section-label">Where did you receive this?</p>
          <div className="mt-3">
            <PlatformSelector value={platform} onChange={setPlatform} />
          </div>
          <div className="mt-3 relative">
            <input
              value={region}
              onChange={handleRegionChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Your region / city (optional)"
              className="w-full rounded-lg border border-border pl-4 pr-12 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button 
              type="button"
              onClick={detectLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-dim hover:text-primary transition-colors"
              title="Detect my location"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-border last:border-0"
                  >
                    <p className="font-medium text-text">{s.display_name.split(',')[0]}</p>
                    <p className="text-[10px] text-text-dim truncate">{s.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="section-label">Anything else?</p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Add context..."
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!content.trim() && !selectedImage)}
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
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <AiScoreRing score={result.threatScore} severity={result.severity} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <SeverityBadge severity={result.severity} solid />
                <ScamTypeTag type={result.scamType} />
              </div>
              <p className="mt-4 text-sm text-text-muted">{result.reasoning}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="section-label">Attack patterns</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.attackPatterns.map((p) => (
                <span key={p} className="rounded-full border border-border bg-gray-50 px-3 py-1 text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            {result.recommendations.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {r}
              </li>
            ))}
          </ul>

          {submitted && (
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-accent">
              <Check className="h-4 w-4" />
              Verified & Added to live feed
            </p>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <VoteButtons reportId="new" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
