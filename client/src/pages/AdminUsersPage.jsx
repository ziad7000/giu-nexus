import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = '/admin/users?';
            if (roleFilter !== 'all') url += `role=${roleFilter}&`;
            if (statusFilter !== 'all') url += `status=${statusFilter}&`;
            const response = await api.get(url);
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (userId, newStatus) => {
        setUpdating(userId);
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u =>
                u._id === userId ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'jobSeeker': return '🎓';
            case 'recruiter': return '💼';
            case 'admin': return '👑';
            default: return '👤';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={styles.page}>
            <div style={styles.orb1} />
            <div style={styles.orb2} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/admin/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
                    <h1 style={styles.title}>Manage Users</h1>
                    <p style={styles.subtitle}>View, approve, and manage all platform users</p>
                </div>

                <ErrorAlert message={error} />

                {/* Filters */}
                <div style={styles.filters}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Role:</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="all">All Roles</option>
                            <option value="jobSeeker">Job Seekers</option>
                            <option value="recruiter">Recruiters</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <button onClick={fetchUsers} style={styles.refreshBtn}>Refresh</button>
                </div>

                {users.length === 0 ? (
                    <div style={styles.emptyState}>No users found.</div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td style={styles.avatarCell}>
                                        <span style={styles.avatar}>{getRoleIcon(user.role)}</span>
                                    </td>
                                    <td style={styles.nameCell}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                      <span style={{
                          ...styles.roleBadge,
                          background: user.role === 'admin' ? '#1a0a2a' : user.role === 'recruiter' ? '#0a1a2a' : '#0a2a1a',
                          color: user.role === 'admin' ? '#c084fc' : user.role === 'recruiter' ? '#60a5fa' : '#4ade80'
                      }}>
                        {user.role === 'jobSeeker' ? 'Job Seeker' : user.role}
                      </span>
                                    </td>
                                    <td>
                      <span style={{
                          ...styles.statusBadge,
                          background: user.status === 'approved' ? '#0a2a1a' :
                              user.status === 'pending' ? '#13102a' : '#1a0a0a',
                          color: user.status === 'approved' ? '#4ade80' :
                              user.status === 'pending' ? '#a78bfa' : '#f87171'
                      }}>
                        {user.status}
                      </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={styles.actions}>
                                            {user.role !== 'admin' && (
                                                <>
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(user._id, 'approved')}
                                                                disabled={updating === user._id}
                                                                style={styles.approveBtn}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(user._id, 'rejected')}
                                                                disabled={updating === user._id}
                                                                style={styles.rejectBtn}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.status === 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(user._id, 'rejected')}
                                                            disabled={updating === user._id}
                                                            style={styles.rejectBtn}
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                    {user.status === 'rejected' && (
                                                        <button
                                                            onClick={() => updateStatus(user._id, 'approved')}
                                                            disabled={updating === user._id}
                                                            style={styles.approveBtn}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => deleteUser(user._id)}
                                                disabled={user.role === 'admin'}
                                                style={{
                                                    ...styles.deleteBtn,
                                                    opacity: user.role === 'admin' ? 0.5 : 1,
                                                    cursor: user.role === 'admin' ? 'not-allowed' : 'pointer'
                                                }}
                                                title={user.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
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
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#0d0d0d', padding: '2rem', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none' },
    orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none' },
    container: { maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { marginBottom: '2rem' },
    backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 8 },
    subtitle: { color: '#666', fontSize: 14 },
    filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    filterLabel: { color: '#999', fontSize: 11, textTransform: 'uppercase' },
    filterSelect: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    refreshBtn: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13 },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#161616', borderRadius: 16, overflow: 'hidden' },
    avatarCell: { width: 50 },
    avatar: { fontSize: 20 },
    nameCell: { fontWeight: 600 },
    roleBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-block' },
    statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-block' },
    actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    approveBtn: { background: '#0a2a1a', border: '0.5px solid #1a5c35', color: '#4ade80', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11 },
    rejectBtn: { background: '#1a0a0a', border: '0.5px solid #3d1515', color: '#f87171', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11 },
    deleteBtn: { background: '#2a0a0a', border: '0.5px solid #5c1a1a', color: '#f87171', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11 },
    emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
};

export default AdminUsersPage;