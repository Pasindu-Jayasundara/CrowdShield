import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { toNewsletterIssue } from '../../utils/mapDoc';
import { formatRelativeTime } from '../../utils/formatDate';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminNewsletter() {
  const sessionToken = getSessionToken() ?? undefined;
  const [tab, setTab] = useState<'compose' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscriberCount = useQuery(api.newsletter.subscriberCount, { sessionToken });
  const history = useQuery(api.newsletter.list, { sessionToken });
  const send = useMutation(api.newsletter.send);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    setError(null);
    try {
      await send({ sessionToken, subject, content });
      setSubject('');
      setContent('');
      setTab('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <div className="mt-4 flex gap-2 border-b border-border">
          {(['compose', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2 text-sm capitalize ${
                tab === t ? 'border-admin text-admin' : 'border-transparent text-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'compose' ? (
          <form className="mt-6 max-w-2xl space-y-4" onSubmit={handleSend}>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject: Weekly Threat Digest"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Newsletter content..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-2"
              required
            />
            <p className="text-sm text-text-dim">
              {subscriberCount !== undefined
                ? `${subscriberCount.toLocaleString()} active subscribers`
                : 'Loading subscribers...'}
            </p>
            <button
              type="submit"
              disabled={sending || subscriberCount === 0}
              className="rounded-lg bg-admin px-6 py-2 font-semibold text-on-primary disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send to Subscribers'}
            </button>
            {error && <p className="text-critical text-sm">{error}</p>}
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {history === undefined && <p className="text-sm text-text-muted">Loading...</p>}
            {history?.length === 0 && (
              <p className="text-sm text-text-muted">No newsletters sent yet.</p>
            )}
            {history?.map((doc) => {
              const n = toNewsletterIssue(doc);
              return (
                <motion.div key={n.id} className="glass rounded-lg p-4">
                  <p className="font-medium">{n.subject}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-text-muted">{n.content}</p>
                  <p className="mt-1 text-sm text-text-dim">
                    Sent {formatRelativeTime(n.sentAt)} · {n.subscriberCount.toLocaleString()}{' '}
                    subscribers
                    {n.openRate > 0 && ` · Open ${n.openRate}% · Click ${n.clickRate}%`}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
