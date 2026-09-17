import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

function SavedJobsPage() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs();
    }
  }, [isAuthenticated]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/saved');
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to load saved jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (jobId) => {
    setJobs(jobs.filter(job => job._id !== jobId));
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loginPrompt}>
            <h1 style={styles.title}>Saved Jobs</h1>
            <p>Please <Link to="/login">login</Link> to view your saved jobs</p>
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
          <h1 style={styles.title}>📌 Saved Jobs</h1>
          <p style={styles.subtitle}>Jobs you've bookmarked for later</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No saved jobs yet.</p>
            <p style={styles.hint}>Click the bookmark icon on any job card to save it here.</p>
            <Link to="/jobs" style={styles.emptyBtn}>Browse Jobs</Link>
          </div>
        ) : (
          <>
            <div style={styles.count}>{jobs.length} saved jobs</div>
            <div style={styles.grid}>
              {jobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </>
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
  title: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  count: { color: '#666', fontSize: 14, marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
  emptyBtn: { display: 'inline-block', background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', marginTop: '1rem' },
  hint: { fontSize: 13, marginTop: 8 },
  errorBox: { background: '#1a0a0a', border: '0.5px solid #3d1515', borderRadius: 8, padding: '1rem', color: '#f87171', textAlign: 'center' },
  loginPrompt: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12 },
};

export default SavedJobsPage;