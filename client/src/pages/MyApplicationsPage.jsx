import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';

function MyApplicationsPage() {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/my');
      setApplications(response.data.applications);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#13102a', color: '#a78bfa', label: 'Pending' },
      shortlisted: { background: '#0a2a1a', color: '#4ade80', label: 'Shortlisted' },
      rejected: { background: '#1a0a0a', color: '#f87171', label: 'Rejected' }
    };
    const s = styles[status] || styles.pending;
    return <span style={{ ...styles.statusBadge, background: s.background, color: s.color }}>{s.label}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loginPrompt}>
            <h1 style={styles.title}>My Applications</h1>
            <p>Please <Link to="/login">login</Link> to view your applications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/" style={styles.backBtn}>← Back to Home</Link>
          <h1 style={styles.title}>📋 My Applications</h1>
          <p style={styles.subtitle}>Track the status of your job applications</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : applications.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" style={styles.emptyBtn}>Browse Jobs</Link>
          </div>
        ) : (
          <div style={styles.applicationsList}>
            {applications.map(app => (
              <div key={app._id} style={styles.applicationCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.jobTitle}>{app.job?.title}</h3>
                    <p style={styles.company}>{app.job?.company}</p>
                  </div>
                  <CategoryBadge category={app.job?.category} />
                </div>
                <div style={styles.jobMeta}>
                  <span>📍 {app.job?.location}</span>
                  <span>💼 {app.job?.type}</span>
                  {getStatusBadge(app.status)}
                </div>
                <div style={styles.appliedDate}>
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
                <Link to={`/jobs/${app.job?._id}`} style={styles.viewJobLink}>View Job Details →</Link>
              </div>
            ))}
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
  container: { maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 },
  header: { marginBottom: '2rem' },
  backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  applicationsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  applicationCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' },
  jobTitle: { color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 4 },
  company: { color: '#888', fontSize: 13 },
  jobMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', color: '#666', fontSize: 13, alignItems: 'center' },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  appliedDate: { color: '#555', fontSize: 12, marginBottom: '1rem' },
  viewJobLink: { color: '#7c3aed', textDecoration: 'none', fontSize: 13 },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
  emptyBtn: { display: 'inline-block', background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', marginTop: '1rem' },
  errorBox: { background: '#1a0a0a', border: '0.5px solid #3d1515', borderRadius: 8, padding: '1rem', color: '#f87171', textAlign: 'center' },
  loginPrompt: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12 },
};

export default MyApplicationsPage;