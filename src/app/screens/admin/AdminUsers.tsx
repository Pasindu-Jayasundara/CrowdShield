import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from 'motion/react';

export function AdminUsers() {
  const [email, setEmail] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const inviteAdmin = useMutation(api.users.inviteAdmin);
  const users = useQuery(api.users.listUsers);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await inviteAdmin({ email });
      setInvitationToken(token);
      alert("Invitation sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send invitation.");
    }
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-text-muted">{users?.length} users</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Invite New Admin</h2>
                <form onSubmit={handleInvite} className="flex items-center gap-2">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                    </label>
                    <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Send Invitation
                </button>
                </form>
                {invitationToken && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                    <p className="text-sm text-gray-600">Invitation Token (for testing):</p>
                    <pre className="text-xs text-gray-800 break-all">{invitationToken}</pre>
                </div>
                )}
            </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Reports</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u._id} className="border-b border-border/50 hover:bg-surface-elevated/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-text-dim">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
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
