import { motion } from 'motion/react';
import { mockUsers } from '../../data/mockData';

export function AdminUsers() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-text-muted">15,293 users · 5.5% conversion to Analyst</p>
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
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-surface-elevated/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-text-dim">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 capitalize">{u.subscriptionPlan}</td>
                  <td className="px-4 py-3">{u.reportsSubmitted}</td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? 'text-accent' : 'text-text-dim'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-xs text-primary hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
