import { useCallback, useDeferredValue, useMemo, useState } from 'react'

const ROLE_OPTIONS = ['all', 'student', 'professor', 'guest', 'admin']

const actionButtonBaseClass = 'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out hover:scale-105 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'

export function UsersTable({ users, loading, onEdit, onToggleBlock, onDelete, onRoleChange, onAddUser }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredUsers = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase()

    return users.filter((user) => {
      const name = String(user.name || '').toLowerCase()
      const email = String(user.email || '').toLowerCase()
      const role = String(user.role || '').toLowerCase()
      const matchesSearch = !normalizedQuery || name.includes(normalizedQuery) || email.includes(normalizedQuery)
      const matchesRole = selectedRole === 'all' || role === selectedRole

      return matchesSearch && matchesRole
    })
  }, [users, deferredSearchQuery, selectedRole])

  const handleRoleSelect = useCallback((userId, role) => {
    if (!onRoleChange) return
    onRoleChange(userId, role)
  }, [onRoleChange])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:flex-1">
          <label htmlFor="users-search" className="sr-only">Search users</label>
          <input
            id="users-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-white/15 bg-bgPrimary/45 px-4 py-2.5 text-sm text-textPrimary placeholder:text-textAccent/80 outline-none transition-colors duration-200 focus:border-accent/55 focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="users-role-filter" className="sr-only">Filter by role</label>
          <select
            id="users-role-filter"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-bgPrimary/45 px-3 py-2.5 text-sm capitalize text-textPrimary outline-none transition-colors duration-200 focus:border-accent/55 focus:ring-2 focus:ring-accent/30"
          >
            {ROLE_OPTIONS.map((roleOption) => (
              <option key={roleOption} value={roleOption} className="bg-bgPrimary text-textPrimary">
                {roleOption === 'all' ? 'All' : roleOption}
              </option>
            ))}
          </select>
        </div>

        {onAddUser ? (
          <button
            type="button"
            onClick={onAddUser}
            className="inline-flex w-full items-center justify-center rounded-full bg-accentCyan/15 px-3 py-2 text-xs font-semibold text-accentCyan transition-colors duration-200 hover:bg-accentCyan/25 sm:w-auto"
          >
            + Add User
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-bgPrimary/45 text-textAccent">
          <tr>
            <th className="sticky top-0 z-10 px-4 py-3 font-medium">Name</th>
            <th className="sticky top-0 z-10 px-4 py-3 font-medium">Email</th>
            <th className="sticky top-0 z-10 px-4 py-3 font-medium">Role</th>
            <th className="sticky top-0 z-10 px-4 py-3 font-medium">Status</th>
            <th className="sticky top-0 z-10 px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-4 text-textAccent" colSpan={5}>Loading users...</td>
            </tr>
          ) : filteredUsers.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-textAccent" colSpan={5}>No users found</td>
            </tr>
          ) : filteredUsers.map((u) => (
            <tr
              key={u._id}
              className={`border-t border-white/10 transition-colors duration-200 hover:bg-white/5 ${u.isBlocked ? 'bg-red-500/5' : ''}`}
            >
              <td className="px-4 py-3.5 text-textPrimary">
                <span className="font-medium">{u.name || 'User'}</span>
              </td>
              <td className="px-4 py-3.5 text-textAccent">{u.email}</td>
              <td className="px-4 py-3.5">
                <select
                  value={u.role || 'student'}
                  onChange={(event) => handleRoleSelect(u._id, event.target.value)}
                  className="w-full min-w-28 rounded-lg border border-white/15 bg-bgPrimary/55 px-2.5 py-1.5 text-xs capitalize text-textPrimary outline-none transition-colors duration-200 focus:border-accent/55 focus:ring-2 focus:ring-accent/30"
                >
                  <option value="student" className="bg-bgPrimary text-textPrimary">Student</option>
                  <option value="professor" className="bg-bgPrimary text-textPrimary">Professor</option>
                  <option value="guest" className="bg-bgPrimary text-textPrimary">Guest</option>
                  <option value="admin" className="bg-bgPrimary text-textPrimary">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3.5">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    u.isBlocked
                      ? 'border-red-300/25 bg-red-500/15 text-red-200'
                      : 'border-emerald-300/25 bg-emerald-500/15 text-emerald-200'
                  }`}
                >
                  {u.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    title="Edit user"
                    aria-label="Edit user"
                    onClick={() => onEdit(u)}
                    className={`${actionButtonBaseClass} bg-[rgba(59,130,246,0.15)] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.25)]`}
                  >
                    Edit
                  </button>
                <button
                  type="button"
                  title={u.isBlocked ? 'Unblock user' : 'Block user'}
                  aria-label={u.isBlocked ? 'Unblock user' : 'Block user'}
                  onClick={() => onToggleBlock(u)}
                  className={`${actionButtonBaseClass} ${u.isBlocked ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] hover:bg-[rgba(16,185,129,0.25)]' : 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] hover:bg-[rgba(245,158,11,0.25)]'}`}
                >
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
                  <button
                    type="button"
                    title="Delete user"
                    aria-label="Delete user"
                    onClick={() => onDelete(u)}
                    className={`${actionButtonBaseClass} bg-[rgba(239,68,68,0.15)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.25)]`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}
