import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/ToastSystem'
import { AdminLayout } from '../components/admin/AdminLayout'
import { DashboardOverview } from '../components/admin/DashboardOverview'
import { UsersTable } from '../components/admin/UsersTable'
import { ResourcesTable } from '../components/admin/ResourcesTable'
import { BuildingsTable } from '../components/admin/BuildingsTable'
import { EditModal } from '../components/admin/EditModal'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'

const API_BASE = 'http://localhost:5000/api'

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { pushToast } = useToast()

  const [activeTab, setActiveTab] = useState('Dashboard')
  const [users, setUsers] = useState([])
  const [resources, setResources] = useState([])
  const [buildings, setBuildings] = useState([])
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalResources: 0,
    totalUploads: 0,
    totalBuildings: 0,
  })
  const [loading, setLoading] = useState(false)
  const loadErrorShownRef = useRef(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [editValues, setEditValues] = useState({})

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(() => () => {})
  const [confirmPayload, setConfirmPayload] = useState({ title: '', message: '' })

  const authConfig = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  }), [user?.token])

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const bumpSummary = (field, delta) => {
    setSummary((prev) => ({
      ...prev,
      [field]: Math.max(0, Number(prev?.[field] || 0) + delta),
    }))
  }

  useEffect(() => {
    if (!user?.token) {
      navigate('/login', { replace: true })
      return
    }
    if (!isAdmin) {
      navigate('/', { replace: true })
      return
    }
  }, [user?.token, isAdmin, navigate])

  const fetchAll = async () => {
    if (!user?.token || !isAdmin) return

    setLoading(true)
    try {
      const [summaryRes, usersRes, resourcesRes, buildingsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/summary`, authConfig),
        axios.get(`${API_BASE}/admin/users`, authConfig),
        axios.get(`${API_BASE}/admin/resources`, authConfig),
        axios.get(`${API_BASE}/admin/buildings`, authConfig),
      ])

      const nextUsers = usersRes.status === 'fulfilled' ? usersRes.value.data : []
      const nextResources = resourcesRes.status === 'fulfilled' ? resourcesRes.value.data : []
      const nextBuildings = buildingsRes.status === 'fulfilled' ? buildingsRes.value.data : []

      setUsers(nextUsers)
      setResources(nextResources)
      setBuildings(nextBuildings)

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data)
      } else {
        setSummary((prev) => ({
          ...prev,
          totalUsers: nextUsers.length,
          totalResources: nextResources.length,
          totalBuildings: nextBuildings.length,
        }))
      }

      const coreFailed = [usersRes, resourcesRes, buildingsRes].every((item) => item.status === 'rejected')
      if (coreFailed && !loadErrorShownRef.current) {
        loadErrorShownRef.current = true
        const statuses = [usersRes, resourcesRes, buildingsRes]
          .filter((item) => item.status === 'rejected')
          .map((item) => item.reason?.response?.status)

        if (statuses.includes(401) || statuses.includes(403)) {
          logout()
          navigate('/login', { replace: true })
          pushToast({
            type: 'error',
            title: 'Session expired',
            message: 'Please log in again to access the admin panel.',
          })
          return
        }

        const firstError = [usersRes, resourcesRes, buildingsRes].find((item) => item.status === 'rejected')
        pushToast({
          type: 'error',
          title: 'Load failed',
          message: firstError?.reason?.response?.data?.message || 'Could not load admin data.',
        })
      } else if (!coreFailed) {
        loadErrorShownRef.current = false
      }
    } catch (error) {
      if (!loadErrorShownRef.current) {
        loadErrorShownRef.current = true
        pushToast({ type: 'error', title: 'Load failed', message: error.response?.data?.message || 'Could not load admin data.' })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [user?.token, isAdmin])

  const askConfirm = (title, message, onConfirm) => {
    setConfirmPayload({ title, message })
    setConfirmAction(() => onConfirm)
    setConfirmOpen(true)
  }

  const openUserEdit = (targetUser) => {
    setCreatingUser(false)
    setEditingUser(targetUser)
    setEditingResource(null)
    setEditingBuilding(null)
    setEditValues({
      name: targetUser.name || '',
      email: targetUser.email || '',
      role: targetUser.role || 'student',
    })
    setEditModalOpen(true)
  }

  const saveUserEdit = async (e) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const payload = {
        name: String(editValues.name || '').trim(),
        email: String(editValues.email || '').trim(),
        role: editValues.role,
      }
      const { data } = await axios.put(`${API_BASE}/admin/users/${editingUser._id}`, payload, authConfig)
      setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? data : u)))
      pushToast({ type: 'success', title: 'User updated', message: 'User details saved successfully.' })
      setEditModalOpen(false)
      setEditingUser(null)
    } catch (error) {
      pushToast({ type: 'error', title: 'Update failed', message: error.response?.data?.message || 'Could not update user.' })
    }
  }

  const openCreateUser = () => {
    setEditingUser(null)
    setEditingResource(null)
    setEditingBuilding(null)
    setCreatingUser(true)
    setEditValues({
      name: '',
      email: '',
      password: '',
      role: 'student',
    })
    setEditModalOpen(true)
  }

  const saveCreateUser = async (e) => {
    e.preventDefault()

    const name = String(editValues.name || '').trim()
    const email = String(editValues.email || '').trim().toLowerCase()
    const password = String(editValues.password || '')
    const role = String(editValues.role || '').toLowerCase()
    const allowedRoles = ['student', 'professor', 'guest', 'admin']
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name || !email || !password || !role) {
      pushToast({ type: 'error', title: 'Validation error', message: 'All fields are required.' })
      return
    }

    if (!emailPattern.test(email)) {
      pushToast({ type: 'error', title: 'Validation error', message: 'Please enter a valid email address.' })
      return
    }

    if (password.length < 6) {
      pushToast({ type: 'error', title: 'Validation error', message: 'Password must be at least 6 characters.' })
      return
    }

    if (!allowedRoles.includes(role)) {
      pushToast({ type: 'error', title: 'Validation error', message: 'Invalid role selected.' })
      return
    }

    try {
      const { data } = await axios.post(`${API_BASE}/admin/users`, { name, email, password, role }, authConfig)
      setUsers((prev) => [data, ...prev])
      bumpSummary('totalUsers', 1)
      pushToast({ type: 'success', title: 'User created', message: 'User created successfully.' })
      setEditModalOpen(false)
      setCreatingUser(false)
    } catch (error) {
      pushToast({ type: 'error', title: 'Create failed', message: error.response?.data?.message || 'Could not create user.' })
    }
  }

  const handleToggleBlock = (targetUser) => {
    const nextBlocked = !Boolean(targetUser.isBlocked)
    const verb = nextBlocked ? 'Block' : 'Unblock'

    askConfirm(
      `${verb} user`,
      `${verb} ${targetUser.email}?`,
      async () => {
        try {
          const { data } = await axios.patch(`${API_BASE}/admin/users/${targetUser._id}/block`, { isBlocked: nextBlocked }, authConfig)
          console.log('[ADMIN_UI_BLOCK] response', data)

          if (data?.success === true && data?.user) {
            setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? data.user : u)))
          } else if (data?._id) {
            // Backward-compatible fallback for legacy response shape.
            setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? data : u)))
          } else {
            throw new Error(data?.message || 'Unexpected block response')
          }

          pushToast({
            type: 'success',
            title: `User ${nextBlocked ? 'blocked' : 'unblocked'}`,
            message: `${targetUser.email} is now ${nextBlocked ? 'blocked' : 'active'}.`,
          })
        } catch (error) {
          console.error('[ADMIN_UI_BLOCK] error', error)
          pushToast({
            type: 'error',
            title: `${verb} failed`,
            message: error.response?.data?.message || `Could not ${verb.toLowerCase()} user.`,
          })
        } finally {
          setConfirmOpen(false)
        }
      },
    )
  }

  const handleRoleChange = async (userId, role) => {
    try {
      const { data } = await axios.put(`${API_BASE}/admin/users/${userId}`, { role }, authConfig)
      setUsers((prev) => prev.map((u) => (u._id === userId ? data : u)))
      pushToast({ type: 'success', title: 'Role updated', message: 'User role changed successfully.' })
    } catch (error) {
      pushToast({ type: 'error', title: 'Update failed', message: error.response?.data?.message || 'Could not update role.' })
    }
  }

  const handleDeleteUser = (targetUser) => {
    askConfirm(
      'Delete user',
      `Delete ${targetUser.email}? This action cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API_BASE}/admin/users/${targetUser._id}`, authConfig)
          setUsers((prev) => prev.filter((u) => u._id !== targetUser._id))
          bumpSummary('totalUsers', -1)
          pushToast({ type: 'success', title: 'User deleted', message: 'The user was removed.' })
        } catch (error) {
          pushToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.message || 'Could not delete user.' })
        } finally {
          setConfirmOpen(false)
        }
      },
    )
  }

  const openResourceEdit = (resource) => {
    setCreatingUser(false)
    setEditingUser(null)
    setEditingResource(resource)
    setEditingBuilding(null)
    setEditValues({
      title: resource.title,
      subject: resource.subject,
      location: resource.location,
    })
    setEditModalOpen(true)
  }

  const saveResourceEdit = async (e) => {
    e.preventDefault()
    if (!editingResource) return

    try {
      const { data } = await axios.put(`${API_BASE}/admin/resources/${editingResource._id}`, editValues, authConfig)
      setResources((prev) => prev.map((r) => (r._id === editingResource._id ? data : r)))
      pushToast({ type: 'success', title: 'Resource updated', message: 'Resource details saved.' })
      setEditModalOpen(false)
      setEditingResource(null)
    } catch (error) {
      pushToast({ type: 'error', title: 'Update failed', message: error.response?.data?.message || 'Could not update resource.' })
    }
  }

  const handleResourceStatus = async (resourceId, status) => {
    try {
      const { data } = await axios.put(`${API_BASE}/admin/resources/${resourceId}`, { status }, authConfig)
      setResources((prev) => prev.map((r) => (r._id === resourceId ? data : r)))
    } catch (error) {
      pushToast({ type: 'error', title: 'Status update failed', message: error.response?.data?.message || 'Could not update status.' })
    }
  }

  const handleDeleteResource = (resource) => {
    askConfirm(
      'Delete resource',
      `Delete ${resource.title}?`,
      async () => {
        try {
          await axios.delete(`${API_BASE}/admin/resources/${resource._id}`, authConfig)
          setResources((prev) => prev.filter((r) => r._id !== resource._id))
          bumpSummary('totalResources', -1)
          pushToast({ type: 'success', title: 'Resource deleted', message: 'The resource was removed.' })
        } catch (error) {
          pushToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.message || 'Could not delete resource.' })
        } finally {
          setConfirmOpen(false)
        }
      },
    )
  }

  const handleAddBuilding = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const key = formData.get('key')
    const label = formData.get('label')
    const type = formData.get('type')
    const x = Number(formData.get('x'))
    const z = Number(formData.get('z'))

    try {
      const payload = {
        key,
        id: label,
        label,
        type,
        position: [x, 0, z],
        buildingType: 'block',
        buildingProps: { w: 2.4, h: 1, d: 2 },
      }
      const { data } = await axios.post(`${API_BASE}/admin/buildings`, payload, authConfig)
      setBuildings((prev) => [data, ...prev])
      bumpSummary('totalBuildings', 1)
      e.currentTarget.reset()
      pushToast({ type: 'success', title: 'Building added', message: 'Map building was created.' })
    } catch (error) {
      pushToast({ type: 'error', title: 'Add failed', message: error.response?.data?.message || 'Could not add building.' })
    }
  }

  const openBuildingEdit = (building) => {
    setCreatingUser(false)
    setEditingUser(null)
    setEditingBuilding(building)
    setEditingResource(null)
    setEditValues({
      label: building.label,
      type: building.type,
      x: String(building.position?.[0] ?? 0),
      z: String(building.position?.[2] ?? 0),
    })
    setEditModalOpen(true)
  }

  const saveBuildingEdit = async (e) => {
    e.preventDefault()
    if (!editingBuilding) return

    try {
      const payload = {
        label: editValues.label,
        type: editValues.type,
        position: [Number(editValues.x), 0, Number(editValues.z)],
      }
      const { data } = await axios.put(`${API_BASE}/admin/buildings/${editingBuilding._id}`, payload, authConfig)
      setBuildings((prev) => prev.map((b) => (b._id === editingBuilding._id ? data : b)))
      pushToast({ type: 'success', title: 'Building updated', message: 'Map building updated successfully.' })
      setEditModalOpen(false)
      setEditingBuilding(null)
    } catch (error) {
      pushToast({ type: 'error', title: 'Update failed', message: error.response?.data?.message || 'Could not update building.' })
    }
  }

  const handleDeleteBuilding = (building) => {
    askConfirm(
      'Delete building',
      `Delete ${building.label}?`,
      async () => {
        try {
          await axios.delete(`${API_BASE}/admin/buildings/${building._id}`, authConfig)
          setBuildings((prev) => prev.filter((b) => b._id !== building._id))
          bumpSummary('totalBuildings', -1)
          pushToast({ type: 'success', title: 'Building deleted', message: 'Map building removed.' })
        } catch (error) {
          pushToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.message || 'Could not delete building.' })
        } finally {
          setConfirmOpen(false)
        }
      },
    )
  }

  if (!user?.token || !isAdmin) return null

  const modalFields = creatingUser
    ? [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password', type: 'password' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Student', value: 'student' },
          { label: 'Professor', value: 'professor' },
          { label: 'Guest', value: 'guest' },
          { label: 'Admin', value: 'admin' },
        ],
      },
    ]
    : editingUser
    ? [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Student', value: 'student' },
          { label: 'Professor', value: 'professor' },
          { label: 'Guest', value: 'guest' },
          { label: 'Admin', value: 'admin' },
        ],
      },
    ]
    : editingResource
    ? [
      { name: 'title', label: 'Title' },
      { name: 'subject', label: 'Subject' },
      { name: 'location', label: 'Location (Library/Lab/Classroom)' },
    ]
    : [
      { name: 'label', label: 'Building Name' },
      { name: 'type', label: 'Building Type' },
      { name: 'x', label: 'Position X' },
      { name: 'z', label: 'Position Z' },
    ]

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1">
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'Dashboard' ? (
            <DashboardOverview
              summary={summary}
              loading={loading}
              onAddUser={openCreateUser}
            />
          ) : null}

          {activeTab === 'Users' ? (
            <UsersTable
              users={users}
              loading={loading}
              onEdit={openUserEdit}
              onToggleBlock={handleToggleBlock}
              onDelete={handleDeleteUser}
              onRoleChange={handleRoleChange}
              onAddUser={openCreateUser}
            />
          ) : null}

          {activeTab === 'Resources' ? (
            <ResourcesTable
              resources={resources}
              loading={loading}
              onEdit={openResourceEdit}
              onDelete={handleDeleteResource}
              onStatusChange={handleResourceStatus}
            />
          ) : null}

          {activeTab === 'Map' ? (
            <BuildingsTable
              buildings={buildings}
              loading={loading}
              onAdd={handleAddBuilding}
              onEdit={openBuildingEdit}
              onDelete={handleDeleteBuilding}
            />
          ) : null}
        </AdminLayout>
      </div>

      <EditModal
        open={editModalOpen}
        title={creatingUser ? 'Create User' : editingUser ? 'Edit User' : editingResource ? 'Edit Resource' : 'Edit Building'}
        fields={modalFields}
        values={editValues}
        onChange={(name, value) => setEditValues((prev) => ({ ...prev, [name]: value }))}
        onClose={() => {
          setEditModalOpen(false)
          setCreatingUser(false)
          setEditingUser(null)
          setEditingResource(null)
          setEditingBuilding(null)
        }}
        onSubmit={creatingUser ? saveCreateUser : editingUser ? saveUserEdit : editingResource ? saveResourceEdit : saveBuildingEdit}
        submitLabel={creatingUser ? 'Create User' : 'Save'}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmPayload.title}
        message={confirmPayload.message}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />

      <Footer />
    </div>
  )
}
