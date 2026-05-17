import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { toSupportMessage } from '../../utils/mapDoc';
import type { SupportMessage } from '../../types';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminMessages() {
  const sessionToken = getSessionToken() ?? undefined;
  const messages = useQuery(api.supportMessages.list, { sessionToken });
  const reply = useMutation(api.supportMessages.reply);
  const updateStatus = useMutation(api.supportMessages.updateStatus);

  const mapped = messages?.map(toSupportMessage) ?? [];
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (mapped.length > 0 && !selected) {
      setSelected(mapped[0]);
    }
  }, [mapped, selected]);

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    await reply({
      sessionToken,
      messageId: selected.id as Id<'supportMessages'>,
      text: replyText,
      isAdmin: true,
    });
    setReplyText('');
  };

  const markClosed = async () => {
    if (!selected) return;
    await updateStatus({
      sessionToken,
      messageId: selected.id as Id<'supportMessages'>,
      status: 'closed',
    });
  };

  if (messages === undefined) {
    return <p className="p-6 text-sm text-text-muted">Loading messages...</p>;
  }

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <div className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <div className="border-b border-border p-4">
          <h1 className="font-bold">Messages</h1>
        </div>
        {mapped.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m)}
            className={`w-full border-b border-border/50 p-4 text-left hover:bg-surface-elevated ${
              selected?.id === m.id ? 'bg-surface-elevated' : ''
            } ${m.status === 'new' ? 'border-l-2 border-l-primary' : ''}`}
          >
            <p className="truncate text-sm font-medium">{m.subject}</p>
            <p className="text-xs text-text-dim">{m.userEmail}</p>
            <span
              className={`mt-1 inline-block text-xs capitalize ${m.priority === 'high' ? 'text-critical' : 'text-text-dim'}`}
            >
              {m.priority} · {m.status}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {selected ? (
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
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Type your reply..."
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={sendReply}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary"
                >
                  Send Reply
                </button>
                <button
                  type="button"
                  onClick={markClosed}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Mark Closed
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-text-muted">No support messages yet.</p>
        )}
      </div>
    </div>
  );
}
