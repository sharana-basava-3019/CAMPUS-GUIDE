export function ResourcesTable({ resources, loading, onEdit, onDelete, onStatusChange }) {
  const statuses = ['approved', 'pending', 'rejected']
  const actionButtonBaseClass = 'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out hover:scale-105 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-textAccent">Resources Management</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-bgPrimary/30 text-textAccent">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Uploaded By</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="px-4 py-4 text-textAccent" colSpan={6}>Loading resources...</td></tr>
          ) : resources.length === 0 ? (
            <tr><td className="px-4 py-4 text-textAccent" colSpan={6}>No resources found.</td></tr>
          ) : resources.map((r) => (
            <tr key={r._id} className="border-t border-white/10">
              <td className="px-4 py-3 text-textPrimary">{r.title}</td>
              <td className="px-4 py-3 text-textAccent">{r.subject}</td>
              <td className="px-4 py-3 text-textAccent">{r.uploadedBy?.name || r.uploadedBy?.email || '-'}</td>
              <td className="px-4 py-3 text-textAccent">{r.location}</td>
              <td className="px-4 py-3">
                <select
                  value={r.status || 'approved'}
                  onChange={(e) => onStatusChange(r._id, e.target.value)}
                  className="rounded-lg border border-white/10 bg-bgPrimary/35 px-2 py-1 text-textPrimary"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className={`${actionButtonBaseClass} bg-[rgba(59,130,246,0.15)] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.25)]`}
                  >
                  Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
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
