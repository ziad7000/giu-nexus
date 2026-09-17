import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={styles.errorBox}>{error}</div>;

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <div style={styles.statValue}>{stats?.usersByRole?.jobSeeker || 0}</div>
              <div style={styles.statLabel}>Job Seekers</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💼</div>
            <div>
              <div style={styles.statValue}>{stats?.usersByRole?.recruiter || 0}</div>
              <div style={styles.statLabel}>Recruiters</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <div>
              <div style={styles.statValue}>{stats?.jobsByStatus?.open || 0}</div>
              <div style={styles.statLabel}>Open Jobs</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div>
              <div style={styles.statValue}>{stats?.appsByStatus?.pending || 0}</div>
              <div style={styles.statLabel}>Pending Apps</div>
            </div>
          </div>
        </div>

        {/* Top Jobs Section */}
        {stats?.topJobs?.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔥 Top Jobs by Applications</h2>
            <div style={styles.topJobsList}>
              {stats.topJobs.map((job, idx) => (
                <div key={idx} style={styles.topJobCard}>
                  <div style={styles.topJobRank}>{idx + 1}</div>
                  <div style={styles.topJobInfo}>
                    <div style={styles.topJobTitle}>{job.title}</div>
                    <div style={styles.topJobCompany}>{job.company}</div>
                  </div>
                  <div style={styles.topJobCount}>{job.applicationCount} apps</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <Link to="/admin/users" style={styles.actionCard}>
              <div style={styles.actionIcon}>👥</div>
              <div>Manage Users</div>
              <small>Approve recruiters, delete users</small>
            </Link>
            <Link to="/admin/jobs" style={styles.actionCard}>
              <div style={styles.actionIcon}>📋</div>
              <div>Manage Jobs</div>
              <small>View and manage all job posts</small>
            </Link>
          </div>
        </div>
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
  title: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  statIcon: { fontSize: 32 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: 700 },
  statLabel: { color: '#666', fontSize: 13 },
  section: { marginBottom: '2rem' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: '1rem' },
  topJobsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  topJobCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  topJobRank: { width: 30, height: 30, background: '#7c3aed', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 },
  topJobInfo: { flex: 1 },
  topJobTitle: { color: '#fff', fontWeight: 600 },
  topJobCompany: { color: '#666', fontSize: 12 },
  topJobCount: { color: '#a78bfa', fontSize: 13, fontWeight: 500 },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  actionCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem', textAlign: 'center', textDecoration: 'none', color: '#fff', transition: 'border-color 0.2s' },
  actionIcon: { fontSize: 32, marginBottom: '0.5rem' },
  errorBox: { background: '#1a0a0a', border: '0.5px solid #3d1515', borderRadius: 8, padding: '1rem', color: '#f87171', textAlign: 'center' },
};

export default AdminDashboard;
