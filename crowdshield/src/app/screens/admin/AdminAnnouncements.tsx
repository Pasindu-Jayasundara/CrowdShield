import { motion } from 'motion/react';
import { useState } from 'react';

export function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<'all' | 'analysts' | 'free_users'>('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const counts = { all: 15293, analysts: 847, free_users: 14446 };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
    setTitle('');
    setMessage('');
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
          <option value="all">All Users ({counts.all.toLocaleString()})</option>
          <option value="analysts">Analysts ({counts.analysts})</option>
          <option value="free_users">Free Users ({counts.free_users.toLocaleString()})</option>
        </select>
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-admin px-6 py-2 font-semibold text-on-primary disabled:opacity-60"
        >
          {sending ? 'Sending...' : `Send to ${counts[recipients].toLocaleString()} Users`}
        </button>
        {sent && <p className="text-accent">Announcement queued successfully!</p>}
      </form>

      <h2 className="mt-10 text-lg font-semibold">Recent Announcements</h2>
      <div className="mt-4 space-y-3">
        {[
          { title: 'Critical Security Update', sent: '2 days ago', opened: '67%' },
          { title: 'New Analyst Features', sent: '1 week ago', opened: '54%' },
        ].map((a) => (
          <div key={a.title} className="glass rounded-lg p-4">
            <p className="font-medium">{a.title}</p>
            <p className="text-xs text-text-dim">
              {a.sent} · Open rate {a.opened}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
