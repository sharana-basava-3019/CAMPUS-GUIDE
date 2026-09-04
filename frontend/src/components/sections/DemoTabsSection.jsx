import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../ui/Buttons'
import { useToast } from '../ui/ToastSystem'
import { LoginPreviewForm } from './LoginPreviewForm'
import { useAuth } from '../../hooks/useAuth'
import AuthGuard from '../ui/AuthGuard'
import { canAccess } from '../../utils/accessControl'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

// three.js + r3f loaded on-demand — only when user clicks the "3D Map" tab
const ThreeCanvas = lazy(() => import('../map/ThreeCanvas'))
const MapUI       = lazy(() => import('../map/MapUI'))

function ThreeSpinner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '420px', gap: '14px',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(34,211,238,0.18)',
        borderTopColor: '#22d3ee',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>Loading 3D Map…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const tabs = ['Search', '3D Map', 'Download']

// ── Search Tab ─────────────────────────────────────────────
const ResourceCard = ({ resource, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={() => onClick(resource)}
    className="mb-3 cursor-pointer rounded-xl border border-white/10 border-l-4 border-l-accentCyan bg-white/5 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-accent/35 hover:bg-white/10"
  >
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0">
        <h4 className="text-textPrimary font-medium truncate">{resource.title}</h4>
        <p className="text-xs text-textAccent mt-0.5">{resource.subject} · {resource.location}</p>
      </div>
      <span className="shrink-0 rounded-full bg-accentCyan/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accentCyan">
        {resource.location}
      </span>
    </div>
  </motion.div>
)

function AccessGrantedPanel() {
  const { user } = useAuth()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 text-center backdrop-blur-md flex flex-col items-center justify-center sm:min-h-[460px] sm:p-8"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-success/35 bg-success/15">
        <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="font-display text-2xl text-textPrimary mb-2">You're in!</h3>
      <p className="text-sm text-textAccent max-w-xs">
        Signed in as <span className="font-medium text-success">{user?.email}</span>.<br />
        Search resources and select one for full details.
      </p>
    </motion.div>
  )
}

function SearchTabContent() {
  const { pushToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery]             = useState('')
  const [resources, setResources]     = useState([])
  const [selected, setSelected]       = useState(null)
  const [loading, setLoading]         = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkIds, setBookmarkIds] = useState(new Set())

  const canSearchResources = canAccess('search', user?.role)
  const canDownloadResources = canAccess('download', user?.role)
  const canBookmarkResources = canDownloadResources

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  })

  const handleDownload = () => {
    if (!user?.token) {
      navigate('/login')
      return
    }
    if (!canDownloadResources) {
      pushToast({ type: 'info', title: 'Access denied', message: 'Login as Student, Professor, or Admin to access resources' })
      return
    }

    axios
      .get(`${API_BASE_URL}/resources/download/${selected?._id}`, getAuthConfig())
      .then(() => {
        pushToast({ type: 'success', title: 'Download started', message: `"${selected?.title}" is being prepared.` })
      })
      .catch((error) => {
        pushToast({
          type: 'error',
          title: 'Download blocked',
          message: error.response?.status === 403 ? 'Login as Student, Professor, or Admin to access resources' : 'Could not start download.',
        })
      })
  }

  const loadBookmarks = async () => {
    if (!user?.token || !canBookmarkResources) {
      setBookmarkIds(new Set())
      return
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/resources/bookmarks`, getAuthConfig())
      const ids = new Set(data.map((item) => String(item.resource)))
      setBookmarkIds(ids)
    } catch {
      setBookmarkIds(new Set())
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [user?.token, user?.role])

  useEffect(() => {
    if (!selected) {
      setIsBookmarked(false)
      return
    }
    setIsBookmarked(bookmarkIds.has(String(selected._id)))
  }, [selected, bookmarkIds])

  const toggleBookmark = async () => {
    if (!selected || !user?.token || !canBookmarkResources) return

    try {
      if (isBookmarked) {
        await axios.delete(`${API_BASE_URL}/resources/bookmarks/${selected._id}`, getAuthConfig())
        setIsBookmarked(false)
        setBookmarkIds((prev) => {
          const next = new Set(prev)
          next.delete(String(selected._id))
          return next
        })
        pushToast({ type: 'info', title: 'Bookmark removed', message: 'Removed from bookmarks' })
        return
      }

      await axios.post(
        `${API_BASE_URL}/resources/bookmark`,
        { resourceId: selected._id },
        getAuthConfig(),
      )
      setIsBookmarked(true)
      setBookmarkIds((prev) => new Set(prev).add(String(selected._id)))
      pushToast({ type: 'success', title: 'Bookmarked', message: 'Saved to bookmarks' })
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Bookmark failed',
        message: error.response?.data?.message || 'Could not update bookmark.',
      })
    }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()

    if (!user?.token) {
      navigate('/login')
      return
    }
    if (!canSearchResources) {
      pushToast({ type: 'info', title: 'Access denied', message: 'Login as Student, Professor, or Admin to access resources' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE_URL}/resources?search=${query}`, getAuthConfig())
      setResources(data)
      if (data.length > 0) {
        pushToast({ type: 'success', title: 'Results loaded', message: `${data.length} resources found.` })
        setSelected(null)
      } else {
        pushToast({ type: 'info', title: 'No results', message: 'Try "Library", "Calculus", or "Physics".' })
      }
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Search failed',
        message: error.response?.status === 403 ? 'Login as Student, Professor, or Admin to access resources' : 'Could not connect to server.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Left: search + results */}
      <div className="min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-4 backdrop-blur-md flex flex-col sm:min-h-[460px] sm:p-6">
        <h3 className="font-display text-2xl text-textPrimary mb-4">Pinpoint references in seconds</h3>
        <form onSubmit={handleSearch} className="relative mb-5">
          <input
            type="text"
            placeholder="Search topics, courses, buildings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!canSearchResources}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-textPrimary transition-all focus:border-accentCyan/55 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !canSearchResources}
            className="absolute right-2 top-1.5 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] px-4 py-1.5 text-sm text-slate-950 transition-all duration-300 hover:from-[#fbbf24] hover:to-[#f59e0b]"
          >
            {loading ? '…' : 'Search'}
          </button>
        </form>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {!canSearchResources ? (
            <div className="h-full flex items-center justify-center opacity-70 text-center">
              <p className="text-sm text-textAccent italic">Login to access resources</p>
            </div>
          ) : resources.length > 0 ? (
            resources.map((r) => (
              <ResourceCard key={r._id} resource={r} onClick={setSelected} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center opacity-40 text-center">
              <p className="text-sm text-textAccent italic">Try "Library", "Calculus",<br />or "Physics" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: detail / auth-aware panel */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 backdrop-blur-md flex flex-col justify-center sm:min-h-[460px] sm:p-8"
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-textAccent hover:text-white text-xl transition-colors">×</button>
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-accentCyan">Resource Detail</span>
            <h2 className="text-2xl font-display text-textPrimary mb-5">{selected.title}</h2>
            <div className="space-y-3 mb-8">
              <p className="text-sm text-textAccent">Subject: <span className="text-textPrimary font-medium">{selected.subject}</span></p>
              <p className="text-sm text-textAccent">Location: <span className="font-medium text-accentCyan">{selected.location}</span></p>
            </div>
            <PrimaryButton className="w-full py-3" onClick={handleDownload}>Download PDF</PrimaryButton>
            {canBookmarkResources ? (
              <div className="bookmark-container">
                <label className="container">
                  <input
                    type="checkbox"
                    checked={isBookmarked}
                    onChange={toggleBookmark}
                  />

                  <svg className="save-regular" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>

                  <svg className="save-solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
                  </svg>
                </label>
              </div>
            ) : null}
          </motion.div>
        ) : user ? (
          <motion.div key="granted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AccessGrantedPanel />
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginPreviewForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 3D Map Tab ─────────────────────────────────────────────
function MapTabContent() {
  return (
    <AuthGuard>
      {/* No overflow-hidden — it clips the Canvas */}
      <Suspense fallback={<ThreeSpinner />}>
        <div className="relative w-full" style={{ minHeight: '420px' }}>
          <ThreeCanvas />
          <MapUI />
        </div>
      </Suspense>
    </AuthGuard>
  )
}

// ── Download Tab ───────────────────────────────────────────
function DownloadTabContent() {
  const { pushToast } = useToast()
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [downloads, setDownloads] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [uploads, setUploads] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const canDownloadResources = canAccess('download', user?.role)
  const canUploadResources = canAccess('upload', user?.role)

  const normalizedRole = String(user?.role || 'guest').toLowerCase()
  const isProfessor = normalizedRole === 'professor' || normalizedRole === 'faculty'
  const isStudent = normalizedRole === 'student'
  const isGuest = !user?.token || (normalizedRole === 'guest') || (!canDownloadResources && !canUploadResources)

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  })

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString()
  }

  const fetchRoleData = async () => {
    if (!user?.token || isGuest) {
      setDownloads([])
      setBookmarks([])
      setUploads([])
      return
    }

    setLoadingData(true)
    try {
      if (isStudent) {
        const [downloadsRes, bookmarksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/resources/downloads`, getAuthConfig()),
          axios.get(`${API_BASE_URL}/resources/bookmarks`, getAuthConfig()),
        ])
        setDownloads(downloadsRes.data)
        setBookmarks(bookmarksRes.data)
        setUploads([])
      } else if (canUploadResources) {
        const uploadsRes = await axios.get(`${API_BASE_URL}/resources/uploads`, getAuthConfig())
        setUploads(uploadsRes.data)
        setDownloads([])
        setBookmarks([])
      }
    } catch (error) {
      const statusCode = error?.response?.status
      if (statusCode === 401 || statusCode === 403) {
        setDownloads([])
        setBookmarks([])
        setUploads([])
        return
      }

      pushToast({
        type: 'error',
        title: 'Could not load data',
        message: error.response?.data?.message || 'Please try again in a moment.',
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchRoleData()
  }, [user?.token, user?.role])

  const handleResourceDownload = async (resourceId, title = 'resource') => {
    if (!user?.token) {
      pushToast({ type: 'info', title: 'Login required', message: 'Please sign in to continue.' })
      return
    }
    if (!canDownloadResources) {
      pushToast({ type: 'info', title: 'Access denied', message: 'Login as Student, Professor, or Admin to access resources' })
      return
    }
    if (!resourceId) {
      pushToast({ type: 'info', title: 'Unavailable', message: 'No downloadable resource found.' })
      return
    }

    try {
      await axios.get(`${API_BASE_URL}/resources/download/${resourceId}`, getAuthConfig())
      pushToast({ type: 'success', title: 'Download started', message: `${title} is being prepared.` })
      if (isStudent) fetchRoleData()
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Download failed',
        message: error.response?.data?.message || 'Could not download resource.',
      })
    }
  }

  const handleOpenResource = (fileUrl) => {
    if (!fileUrl || fileUrl === '#') {
      pushToast({ type: 'info', title: 'Preview unavailable', message: 'This resource does not have a preview link yet.' })
      return
    }

    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${fileUrl}`
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
  }

  const handleUpload = async () => {
    if (!canUploadResources || !user?.token) return

    if (!selectedFile) {
      pushToast({ type: 'info', title: 'No file selected', message: 'Choose a file before uploading.' })
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/resources/upload`,
        formData,
        getAuthConfig(),
      )

      if (response.status === 200) {
        pushToast({ type: 'success', title: 'Upload complete', message: 'Resource uploaded successfully.' })
        setSelectedFile(null)
        const fileInput = document.getElementById('fileUpload')
        if (fileInput) fileInput.value = ''
        fetchRoleData()
      } else {
        pushToast({ type: 'error', title: 'Upload failed', message: 'Upload failed.' })
      }
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Upload failed',
        message:
          error.response?.status === 403
            ? 'Only professors or admins can upload resources.'
            : error.response?.data?.message || 'Upload failed',
      })
    }
  }

  const triggerFilePicker = () => {
    document.getElementById('fileUpload')?.click()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  const listContainerClasses = 'mt-4 space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar'
  const listItemClasses = 'rounded-xl border border-white/10 bg-bgPrimary/25 p-3 transition-all duration-300 hover:border-accentCyan/35 hover:bg-surface/55'

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 backdrop-blur-md flex flex-col sm:min-h-[460px] sm:p-8">
        <h3 className="font-display text-2xl text-textPrimary mb-2">{canUploadResources ? 'Download / Upload' : 'Download'}</h3>

        {isGuest ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-textAccent">Login to access resources</p>
          </div>
        ) : isStudent ? (
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-textAccent">Downloaded Resources</p>
            <div className={listContainerClasses}>
              {loadingData ? (
                <p className="text-sm text-textAccent/80">Loading...</p>
              ) : downloads.length === 0 ? (
                <p className="text-sm text-textAccent/80">No downloads yet.</p>
              ) : (
                downloads.map((item) => (
                  <div key={item._id} className={listItemClasses}>
                    <p className="text-sm font-medium text-textPrimary truncate">{item.resourceName}</p>
                    <p className="mt-1 text-xs text-textAccent">Downloaded: {formatDate(item.downloadedAt)}</p>
                    <button
                      type="button"
                      onClick={() => handleResourceDownload(item.resource, item.resourceName)}
                      className="mt-2 text-xs text-accentCyan transition-colors duration-300 hover:text-[#67e8f9]"
                    >
                      Download Again
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <input
              id="fileUpload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={triggerFilePicker}
              className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-textPrimary transition-all hover:bg-white/5"
            >
              Upload Resource
            </button>
            {selectedFile ? (
              <p className="mt-2 text-xs text-textAccent">Selected: {selectedFile.name}</p>
            ) : null}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile}
              className="mt-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-textPrimary transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload Selected File
            </button>

            <p className="mt-6 text-xs uppercase tracking-[0.12em] text-textAccent">Upload History</p>
            <div className={listContainerClasses}>
              {loadingData ? (
                <p className="text-sm text-textAccent/80">Loading...</p>
              ) : uploads.length === 0 ? (
                <p className="text-sm text-textAccent/80">No uploads yet.</p>
              ) : (
                uploads.map((item) => (
                  <div key={item._id} className={listItemClasses}>
                    <p className="text-sm font-medium text-textPrimary truncate">{item.fileName}</p>
                    <p className="mt-1 text-xs text-textAccent">Uploaded: {formatDate(item.uploadedAt)}</p>
                    <p className="text-xs text-emerald-300">{item.status || 'Uploaded'}</p>
                    <button
                      type="button"
                      onClick={() => handleResourceDownload(item.resource, item.fileName)}
                      className="mt-2 text-xs text-accentCyan transition-colors duration-300 hover:text-[#67e8f9]"
                    >
                      Re-download
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: auth-aware panel */}
      {isStudent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 backdrop-blur-md flex flex-col sm:min-h-[460px] sm:p-8"
        >
          <h3 className="font-display text-xl text-textPrimary">Bookmarked Resources</h3>
          {(() => {
            // Build a set of downloaded resource IDs for O(1) lookup
            const downloadedIds = new Set(downloads.map((d) => String(d.resource)))
            return (
              <div className={listContainerClasses}>
                {loadingData ? (
                  <p className="text-sm text-textAccent/80">Loading...</p>
                ) : bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <svg className="h-5 w-5 text-textAccent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-textAccent/70">No Bookmarks</p>
                    <p className="text-xs text-textAccent/45">Resources you bookmark will appear here.</p>
                  </div>
                ) : (
                  bookmarks.map((item) => {
                    const alreadyDownloaded = downloadedIds.has(String(item.resource))
                    return (
                      <div key={item._id} className={listItemClasses}>
                        <p className="text-sm font-medium text-textPrimary truncate">{item.title}</p>
                        <p className="mt-1 text-xs text-textAccent">{item.subject} · {item.location}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenResource(item.fileUrl)}
                            className="text-xs text-accentCyan transition-colors duration-300 hover:text-[#67e8f9]"
                          >
                            Open Resource
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResourceDownload(item.resource, item.title)}
                            className="text-xs text-accentCyan transition-colors duration-300 hover:text-[#67e8f9]"
                          >
                            {alreadyDownloaded ? 'Download Again' : 'Download'}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })()}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-[420px] rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 text-center backdrop-blur-md flex flex-col items-center justify-center sm:min-h-[460px] sm:p-8"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-success/35 bg-success/15">
            <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-textPrimary mb-2">{normalizedRole === 'admin' ? 'Admin Access' : isProfessor ? 'Professor Access' : 'Limited Access'}</h3>
          {canUploadResources ? (
            <p className="text-sm text-textAccent max-w-xs">
              Signed in as <span className="font-medium text-success">{user?.email}</span>.<br />
              Upload files and review your upload history.
            </p>
          ) : (
            <p className="text-sm text-textAccent max-w-xs">
              Login to access resources
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ── Main Section ───────────────────────────────────────────
export const DemoTabsSection = () => {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const [activeTab, setActiveTab] = useState('Search')
  const isGuest = Boolean(user?.isGuest) || String(user?.role || '').toLowerCase() === 'guest'
  const disabledTabs = useMemo(() => (isGuest ? new Set(['Search', 'Download']) : new Set()), [isGuest])

  useEffect(() => {
    if (isGuest && activeTab !== '3D Map') {
      setActiveTab('3D Map')
    }
  }, [activeTab, isGuest])

  const handleTabClick = (tab) => {
    if (disabledTabs.has(tab)) {
      pushToast({ type: 'info', title: 'Access restricted', message: 'Login required to access this feature' })
      return
    }

    setActiveTab(tab)
  }

  return (
    <motion.section
      id="test-demo"
      className="w-full px-4 py-8 sm:px-6 md:px-10 md:py-10"
    >
      <div className="w-full max-w-full">
        <div className="w-full rounded-3xl border border-accent/20 bg-surface/70 p-5 shadow-xl backdrop-blur-lg sm:p-7 md:p-8">
          {/* Tab bar */}
          <div className="mb-6 inline-flex w-full max-w-full overflow-x-auto rounded-full border border-accentCyan/20 bg-bgPrimary/60 p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                title={disabledTabs.has(tab) ? 'Login required' : undefined}
                className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm text-textAccent transition-colors duration-300 sm:px-7 ${disabledTabs.has(tab) ? 'cursor-not-allowed opacity-55 hover:text-textAccent' : 'hover:text-accentCyan'}`}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="activeDemoTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706]"
                    transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                  />
                )}
                <span className={`relative z-10 inline-flex items-center font-medium ${activeTab === tab ? 'text-slate-950' : ''}`}>
                  {tab}
                  {disabledTabs.has(tab) ? (
                    <svg viewBox="0 0 24 24" className="ml-1.5 h-3.5 w-3.5 text-textAccent/65" fill="none" aria-hidden>
                      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          {/* Tab content — rendered inline so Canvas mounts only when tab is active */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {activeTab === 'Search'   && <SearchTabContent />}
              {activeTab === '3D Map'   && <MapTabContent />}
              {activeTab === 'Download' && <DownloadTabContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}
