import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Shield, 
  Search, 
  MoreVertical, 
  Trash2, 
  Mail, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

export function AdminUsers() {
  const users = useQuery(api.users.listUsers);
  const updateRole = useMutation(api.users.updateRole);
  const toggleStatus = useMutation(api.users.toggleStatus);
  const removeUser = useMutation(api.users.remove);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.isActive).length || 0,
    analysts: users?.filter(u => u.role === 'analyst').length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
  };

  const handleRoleChange = async (userId: Id<"users">, role: 'public' | 'analyst' | 'admin') => {
    try {
      await updateRole({ userId, role });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleToggleStatus = async (userId: Id<"users">, currentStatus: boolean) => {
    try {
      await toggleStatus({ userId, isActive: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleRemove = async (userId: Id<"users">) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await removeUser({ userId });
      } catch (error) {
        console.error("Failed to remove user:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-text-muted mt-1">
          {stats.total} total users · {stats.active} active · {stats.analysts} analysts
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-white' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-accent' },
          { label: 'Analysts', value: stats.analysts, icon: Shield, color: 'text-primary' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-critical' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-4 rounded-2xl border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-text-dim uppercase tracking-wider font-bold">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
          <input 
            type="text" 
            placeholder="Search by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 focus:border-accent outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-text-dim border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users === undefined ? (
                // Loading Skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-white/5 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-dim">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredUsers?.map((user) => (
                    <motion.tr 
                      key={user._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                              {(user.name || user.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{user.name || user.username || 'Anonymous'}</p>
                            <p className="text-xs text-text-dim flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role || 'public'}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as any)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-accent text-xs capitalize"
                        >
                          <option value="public">Public</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-text-dim">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {user.reportsSubmitted || 0} reports
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive || false)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            user.isActive 
                              ? 'bg-accent/20 text-accent border border-accent/20' 
                              : 'bg-white/10 text-text-dim border border-white/10'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRemove(user._id)}
                          className="p-2 text-text-dim hover:text-critical hover:bg-critical/10 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

