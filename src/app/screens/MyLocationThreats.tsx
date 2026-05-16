import { MapPin, Navigation, Shield, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ReportCard } from '../components/ReportCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { motion, AnimatePresence } from 'motion/react';

export function MyLocationThreats() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const localReports = useQuery(api.reports.getByRegion, region ? { region } : "skip");

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const selectSuggestion = (s: any) => {
    const address = s.address;
    const regionName = address.city || address.town || address.state || address.suburb || address.country;
    setRegion(regionName);
    setLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSearchQuery(regionName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const address = data[0].address;
        const regionName = address.city || address.town || address.state || address.suburb || address.country;
        setRegion(regionName);
        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        setError("Location not found. Try a city or country name.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search location.");
    } finally {
      setSearching(false);
      setShowSuggestions(false);
    }
  };

  const enableLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        try {
          // Reverse geocoding using Nominatim (free OSM service)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          
          // Try to get a meaningful region name (city, town, or state)
          const regionName = data.address.city || data.address.town || data.address.state || data.address.suburb;
          setRegion(regionName);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setRegion("Unknown Region");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!location) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/15 relative"
        >
          <MapPin className="h-12 w-12 text-accent" />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-accent/20"
          />
        </motion.div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Detect Threats Near You</h1>
        <p className="mt-4 text-text-muted text-lg leading-relaxed">
          Enable location access or search for a specific city to identify security threats in that area.
        </p>
        
        <form onSubmit={handleSearch} className="mt-8 flex w-full gap-2 relative">
          <div className="flex-1 relative">
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search city (e.g. Colombo, London)"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-accent outline-none"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden text-left">
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
          <button
            type="submit"
            disabled={searching}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 h-[46px]"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 w-full">
          <div className="h-px bg-border flex-1" />
          <span className="text-text-dim text-xs font-bold uppercase tracking-widest">or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 text-critical bg-critical/10 px-4 py-2 rounded-lg text-sm border border-critical/20">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={enableLocation}
          disabled={loading}
          className="mt-6 w-full bg-accent hover:bg-accent-hover text-white rounded-2xl px-10 py-4 font-bold transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
          {loading ? 'Finding you...' : 'Use My Current Location'}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="h-32 w-32" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <p className="flex items-center gap-2 text-sm font-medium text-accent bg-accent/10 w-fit px-3 py-1 rounded-full">
                  <MapPin className="h-3 w-3" />
                  {region || 'Locating region...'}
                </p>
                <button 
                  onClick={() => { setLocation(null); setRegion(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-accent transition-colors"
                >
                  Change Location
                </button>
              </div>
              <h1 className="text-3xl font-bold">Local Security Pulse</h1>
            </div>
            <SeverityBadge 
              severity={localReports && localReports.length > 5 ? "HIGH" : localReports && localReports.length > 0 ? "MEDIUM" : "LOW"} 
              solid 
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Local Threats', value: localReports?.length || 0, icon: TrendingUp },
              { label: '24h Change', value: 'Live', highlight: true },
              { label: 'Status', value: 'Monitoring', icon: Shield },
              { label: 'Primary Focus', value: region ? 'Active' : 'Scanning' },
            ].map(({ label, value, highlight, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold mb-1">{label}</p>
                <p className={`text-lg flex items-center gap-1 font-bold ${highlight ? 'text-accent' : ''}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 flex gap-4 items-start">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-accent mb-1">Localized Protection Active</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                We are currently monitoring your region for active scams. Stay vigilant against bank-related phishing messages which are currently trending in {region}.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Recent Alerts in {region}
          <span className="bg-white/5 text-text-dim text-xs px-2 py-0.5 rounded-full font-normal">
            {localReports?.length || 0} found
          </span>
        </h2>
      </div>

      <div className="space-y-4">
        {localReports === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-32 rounded-2xl animate-pulse" />
          ))
        ) : localReports.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border-dashed border-white/10">
            <Shield className="h-12 w-12 text-text-dim mx-auto mb-4 opacity-20" />
            <p className="text-text-muted font-medium">Your neighborhood looks clear today.</p>
            <p className="text-xs text-text-dim mt-1 text-center max-w-xs mx-auto">No verified threats have been reported in {region} in the last 24 hours.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {localReports.map((r) => (
              <motion.div
                key={r._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ReportCard report={r as any} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

