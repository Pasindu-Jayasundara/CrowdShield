import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import type { UserRole } from '../../types';
import { toUser } from '../../utils/mapDoc';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminUsers() {
  const sessionToken = getSessionToken() ?? undefined;
  const users = useQuery(api.users.list, { sessionToken });
  const stats = useQuery(api.users.stats, { sessionToken });
  const updateUser = useMutation(api.users.update);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('public');
  const [isActive, setIsActive] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingUser = users?.find((u) => u._id === editingId);

  const openEdit = (userId: string) => {
    const doc = users?.find((u) => u._id === userId);
    if (!doc) return;
    const user = toUser(doc);
    setEditingId(userId);
    setRole(user.role);
    setIsActive(user.isActive);
    setSubscriptionPlan(user.subscriptionPlan);
    setSubscriptionStatus(user.subscriptionStatus);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      await updateUser({
        sessionToken,
        userId: editingId as Id<'users'>,
        role,
        isActive,
        subscriptionPlan,
        subscriptionStatus,
      });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-text-muted">
          {stats
            ? `${stats.total.toLocaleString()} users · ${stats.conversionRate}% conversion to Analyst`
            : 'Loading...'}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Reports</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => {
                const user = toUser(u);
                return (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-surface-elevated/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-text-dim">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 capitalize">{user.subscriptionPlan}</td>
                    <td className="px-4 py-3">{user.reportsSubmitted}</td>
                    <td className="px-4 py-3">
                      <span className={user.isActive ? 'text-accent' : 'text-text-dim'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEdit(user.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Edit User</h2>
                <p className="text-sm text-text-muted">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-text-muted hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>

            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="text-text-muted">Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value="public">Public</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-text-muted">Subscription plan</span>
                <input
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-text-muted">Subscription status</span>
                <input
                  value={subscriptionStatus}
                  onChange={(e) => setSubscriptionStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active account
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-critical">{error}</p>}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-admin px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
