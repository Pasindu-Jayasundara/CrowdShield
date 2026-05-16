import { Globe, Mail, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import type { Platform } from '../types';

const platforms: { id: Platform; label: string; icon: typeof Mail }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'facebook', label: 'Facebook', icon: Share2 },
  { id: 'instagram', label: 'Instagram', icon: Globe },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export function PlatformSelector({
  value,
  onChange,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {platforms.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition ${
            value === id
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-border bg-gray-50 text-text-muted hover:border-border-strong'
          }`}
        >
          <Icon className="h-6 w-6" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
