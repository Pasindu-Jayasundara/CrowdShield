import { motion } from 'motion/react';
import { useState } from 'react';

export function AdminNewsletter() {
  const [tab, setTab] = useState<'compose' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

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
          <form className="mt-6 max-w-2xl space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject: Weekly Threat Digest"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Newsletter content..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-2"
            />
            <p className="text-sm text-text-dim">12,847 active subscribers</p>
            <button type="submit" className="rounded-lg bg-admin px-6 py-2 font-semibold text-on-primary">
              Send to Subscribers
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {[
              { subject: 'Weekly Threat Digest - May 2024', sent: 'May 10', open: '42%', click: '8%' },
              { subject: 'Phishing Alert — Colombo Region', sent: 'May 3', open: '38%', click: '12%' },
            ].map((n) => (
              <div key={n.subject} className="glass rounded-lg p-4">
                <p className="font-medium">{n.subject}</p>
                <p className="mt-1 text-sm text-text-dim">
                  Sent {n.sent} · Open {n.open} · Click {n.click}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
