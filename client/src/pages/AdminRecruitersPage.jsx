import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users?role=recruiter');
      setRecruiters(response.data.users);
    } catch (err) {
      setError('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, newStatus) => {
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setRecruiters(recruiters.map(r =>
        r._id === userId ? { ...r, status: newStatus } : r
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
      setRecruiters(recruiters.filter(r => r._id !== userId));
    } catch (err) {
      alert('Failed to delete user');
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
          <h1 style={styles.title}>Manage Recruiters</h1>
          <p style={styles.subtitle}>Approve or reject recruiter accounts</p>
        </div>

        <ErrorAlert message={error} />

        {recruiters.length === 0 ? (
          <div style={styles.emptyState}>No recruiters found.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map(recruiter => (
                  <tr key={recruiter._id}>
                    <td style={styles.nameCell}>{recruiter.name}</td>
                    <td>{recruiter.email}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: recruiter.status === 'approved' ? '#0a2a1a' :
                                   recruiter.status === 'pending' ? '#13102a' : '#1a0a0a',
                        color: recruiter.status === 'approved' ? '#4ade80' :
                               recruiter.status === 'pending' ? '#a78bfa' : '#f87171'
                      }}>
                        {recruiter.status}
                      </span>
                    </td>
                    <td>{new Date(recruiter.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={styles.actions}>
                        {recruiter.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(recruiter._id, 'approved')}
                              disabled={updating === recruiter._id}
                              style={styles.approveBtn}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(recruiter._id, 'rejected')}
                              disabled={updating === recruiter._id}
                              style={styles.rejectBtn}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {recruiter.status === 'approved' && (
                          <button
                            onClick={() => updateStatus(recruiter._id, 'rejected')}
                            disabled={updating === recruiter._id}
                            style={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        )}
                        {recruiter.status === 'rejected' && (
                          <button
                            onClick={() => updateStatus(recruiter._id, 'approved')}
                            disabled={updating === recruiter._id}
                            style={styles.approveBtn}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(recruiter._id)}
                          style={styles.deleteBtn}
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
  container: { maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  header: { marginBottom: '2rem' },
  backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#161616', borderRadius: 16, overflow: 'hidden' },
  nameCell: { fontWeight: 600 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-block' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  approveBtn: { background: '#0a2a1a', border: '0.5px solid #1a5c35', color: '#4ade80', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  rejectBtn: { background: '#1a0a0a', border: '0.5px solid #3d1515', color: '#f87171', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  deleteBtn: { background: '#2a0a0a', border: '0.5px solid #5c1a1a', color: '#f87171', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
};

export default AdminRecruitersPage;
