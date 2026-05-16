import { useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { api } from '../../../../convex/_generated/api';
import { toUser } from '../../utils/mapDoc';

export function AdminUsers() {
  const users = useQuery(api.users.list, {});
  const stats = useQuery(api.users.stats);

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-text-muted">
          {stats ? `${stats.total.toLocaleString()} users · ${stats.conversionRate}% conversion to Analyst` : 'Loading...'}
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
                      <button type="button" className="text-xs text-primary hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
