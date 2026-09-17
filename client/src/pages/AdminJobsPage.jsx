import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';
import ErrorAlert from '../components/ErrorAlert';

function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/jobs?limit=100');
            setJobs(response.data.jobs);
        } catch (err) {
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
        setDeleting(jobId);
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (err) {
            alert('Failed to delete job');
        } finally {
            setDeleting(null);
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div style={styles.page}>
            <div style={styles.orb1} />
            <div style={styles.orb2} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/admin/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
                    <h1 style={styles.title}>Manage Jobs</h1>
                    <p style={styles.subtitle}>View and manage all job postings on the platform</p>
                </div>

                <ErrorAlert message={error} />

                {/* Filters */}
                <div style={styles.filters}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {})}}
                    >
                        All Jobs ({jobs.length})
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        style={{...styles.filterBtn, ...(filter === 'open' ? styles.filterActive : {})}}
                    >
                        Open ({jobs.filter(j => j.status === 'open').length})
                    </button>
                    <button
                        onClick={() => setFilter('closed')}
                        style={{...styles.filterBtn, ...(filter === 'closed' ? styles.filterActive : {})}}
                    >
                        Closed ({jobs.filter(j => j.status === 'closed').length})
                    </button>
                </div>

                {filteredJobs.length === 0 ? (
                    <div style={styles.emptyState}>No jobs found.</div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Posted By</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredJobs.map(job => (
                                <tr key={job._id}>
                                    <td style={styles.titleCell}>
                                        <Link to={`/jobs/${job._id}`} style={styles.jobLink}>
                                            {job.title}
                                        </Link>
                                    </td>
                                    <td>{job.company}</td>
                                    <td><CategoryBadge category={job.category} /></td>
                                    <td>{job.location}</td>
                                    <td>
                      <span style={{
                          ...styles.statusBadge,
                          background: job.status === 'open' ? '#0a2a1a' : '#1a1a1a',
                          color: job.status === 'open' ? '#4ade80' : '#9ca3af'
                      }}>
                        {job.status}
                      </span>
                                    </td>
                                    <td style={styles.recruiterCell}>
                                        {job.createdBy?.name || 'Unknown'}
                                        <span style={styles.recruiterEmail}>{job.createdBy?.email}</span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => deleteJob(job._id)}
                                            disabled={deleting === job._id}
                                            style={styles.deleteBtn}
                                        >
                                            {deleting === job._id ? '...' : 'Delete'}
                                        </button>
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
    filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    filterBtn: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', color: '#999', cursor: 'pointer', fontSize: 13 },
    filterActive: { background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#161616', borderRadius: 16, overflow: 'hidden' },
    titleCell: { fontWeight: 600 },
    jobLink: { color: '#7c3aed', textDecoration: 'none' },
    statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-block' },
    recruiterCell: { display: 'flex', flexDirection: 'column', gap: 2 },
    recruiterEmail: { fontSize: 11, color: '#555' },
    deleteBtn: { background: '#2a0a0a', border: '0.5px solid #5c1a1a', color: '#f87171', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
    emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
};

export default AdminJobsPage;