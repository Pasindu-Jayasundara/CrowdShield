import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { toAnnouncement } from '../../utils/mapDoc';
import { formatRelativeTime } from '../../utils/formatDate';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminAnnouncements() {
  const sessionToken = getSessionToken() ?? undefined;
  const counts = useQuery(api.announcements.recipientCounts, { sessionToken });
  const recent = useQuery(api.announcements.list, { sessionToken });
  const create = useMutation(api.announcements.create);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<'all' | 'analysts' | 'free_users'>('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipientCounts = counts ?? { all: 0, analysts: 0, free_users: 0 };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await create({ sessionToken, title, message, recipients });
      setSent(true);
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold">Announcements</h1>
      <p className="text-text-muted">Broadcast messages to user groups</p>

      <form onSubmit={handleSend} className="mt-6 max-w-2xl space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2"
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Message"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2"
          required
        />
        <select
          value={recipients}
          onChange={(e) => setRecipients(e.target.value as typeof recipients)}
          className="rounded-lg border border-border bg-surface px-4 py-2"
        >
          <option value="all">All Users ({recipientCounts.all.toLocaleString()})</option>
          <option value="analysts">Analysts ({recipientCounts.analysts})</option>
          <option value="free_users">Free Users ({recipientCounts.free_users.toLocaleString()})</option>
        </select>
        <button
          type="submit"
          disabled={sending || counts === undefined}
          className="rounded-lg bg-admin px-6 py-2 font-semibold text-on-primary disabled:opacity-60"
        >
          {sending ? 'Sending...' : `Send to ${recipientCounts[recipients].toLocaleString()} Users`}
        </button>
        {sent && (
          <p className="text-accent">
            Announcement queued — emails send to app users and newsletter subscribers (SendGrid).
          </p>
        )}
        {error && <p className="text-critical text-sm">{error}</p>}
      </form>

      <h2 className="mt-10 text-lg font-semibold">Recent Announcements</h2>
      <motion.div className="mt-4 space-y-3">
        {recent === undefined && <p className="text-sm text-text-muted">Loading...</p>}
        {recent?.length === 0 && (
          <p className="text-sm text-text-muted">No announcements sent yet.</p>
        )}
        {recent?.map((doc) => {
          const a = toAnnouncement(doc);
          return (
            <motion.div key={a.id} className="glass rounded-lg p-4">
              <p className="font-medium">{a.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">{a.message}</p>
              <p className="mt-1 text-xs text-text-dim">
                {formatRelativeTime(a.sentAt)} · {a.recipientCount.toLocaleString()} in-app ·{' '}
                {a.recipients.replace('_', ' ')}
                {a.emailsSent != null && ` · ${a.emailsSent} emailed`}
                {a.emailsFailed != null && a.emailsFailed > 0 && ` · ${a.emailsFailed} failed`}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
