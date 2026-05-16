import { motion } from 'motion/react';
import { useState } from 'react';
import { mockMessages } from '../../data/mockData';

export function AdminMessages() {
  const [selected, setSelected] = useState(mockMessages[0]);
  const [reply, setReply] = useState('');

  const sendReply = () => {
    if (!reply.trim()) return;
    setReply('');
  };

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <div className="w-80 shrink-0 border-r border-border overflow-y-auto">
        <div className="border-b border-border p-4">
          <h1 className="font-bold">Messages</h1>
        </div>
        {mockMessages.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m)}
            className={`w-full border-b border-border/50 p-4 text-left hover:bg-surface-elevated ${
              selected.id === m.id ? 'bg-surface-elevated' : ''
            } ${m.status === 'new' ? 'border-l-2 border-l-primary' : ''}`}
          >
            <p className="truncate font-medium text-sm">{m.subject}</p>
            <p className="text-xs text-text-dim">{m.userEmail}</p>
            <span className={`mt-1 inline-block text-xs capitalize ${m.priority === 'high' ? 'text-critical' : 'text-text-dim'}`}>
              {m.priority} · {m.status}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-lg font-bold">{selected.subject}</h2>
          <p className="text-sm text-text-dim">{selected.userEmail}</p>
          <div className="mt-4 space-y-3">
            <motion.div className="glass rounded-lg p-4 text-sm">{selected.message}</motion.div>
            {selected.replies.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 text-sm ${r.isAdmin ? 'ml-8 bg-primary/10' : 'glass'}`}
              >
                {r.text}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Type your reply..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
            />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={sendReply} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary">
                Send Reply
              </button>
              <button type="button" className="rounded-lg border border-border px-4 py-2 text-sm">
                Mark Closed
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
