export function BuildingsTable({ buildings, loading, onAdd, onEdit, onDelete }) {
  const actionButtonBaseClass = 'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out hover:scale-105 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-bgPrimary/25 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-textAccent">Add Building</p>
        <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input name="key" placeholder="Key (e.g. NewBlock)" required className="rounded-lg border border-white/10 bg-bgPrimary/40 px-3 py-2 text-sm text-textPrimary" />
          <input name="label" placeholder="Name" required className="rounded-lg border border-white/10 bg-bgPrimary/40 px-3 py-2 text-sm text-textPrimary" />
          <input name="type" placeholder="Type" required className="rounded-lg border border-white/10 bg-bgPrimary/40 px-3 py-2 text-sm text-textPrimary" />
          <input name="x" placeholder="X position" type="number" step="0.1" required className="rounded-lg border border-white/10 bg-bgPrimary/40 px-3 py-2 text-sm text-textPrimary" />
          <input name="z" placeholder="Z position" type="number" step="0.1" required className="rounded-lg border border-white/10 bg-bgPrimary/40 px-3 py-2 text-sm text-textPrimary" />
          <button type="submit" className="rounded-lg bg-surface/80 px-3 py-2 text-sm font-semibold text-textPrimary hover:bg-surface sm:col-span-2 lg:col-span-1">
            Add
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-bgPrimary/30 text-textAccent">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-4 text-textAccent" colSpan={4}>Loading buildings...</td></tr>
            ) : buildings.length === 0 ? (
              <tr><td className="px-4 py-4 text-textAccent" colSpan={4}>No custom buildings yet.</td></tr>
            ) : buildings.map((b) => (
              <tr key={b._id} className="border-t border-white/10">
                <td className="px-4 py-3 text-textPrimary">{b.label}</td>
                <td className="px-4 py-3 text-textAccent">{b.type}</td>
                <td className="px-4 py-3 text-textAccent">[{b.position?.[0]}, {b.position?.[1]}, {b.position?.[2]}]</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(b)}
                      className={`${actionButtonBaseClass} bg-[rgba(59,130,246,0.15)] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.25)]`}
                    >
                    Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(b)}
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
