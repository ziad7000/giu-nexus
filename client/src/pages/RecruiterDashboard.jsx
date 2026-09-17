import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';

function RecruiterDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applicantCounts, setApplicantCounts] = useState({});

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/jobs/my-jobs');
            setJobs(response.data.jobs);
            // Fetch applicant counts for each job
            const counts = {};
            for (const job of response.data.jobs) {
                try {
                    const appsRes = await api.get(`/jobs/${job._id}/applicants`);
                    counts[job._id] = appsRes.data.applications.length;
                } catch (err) {
                    counts[job._id] = 0;
                }
            }
            setApplicantCounts(counts);
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    if (user?.status === 'pending') {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.pendingBanner}>
                        <h1 style={styles.title}>⏳ Account Pending Approval</h1>
                        <p>Your recruiter account is waiting for admin approval.</p>
                        <p>You'll be able to post jobs once approved.</p>
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
                    <h1 style={styles.title}>Recruiter Dashboard</h1>
                    <Link to="/recruiter/jobs/create" style={styles.createBtn}>+ Post New Job</Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : jobs.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>You haven't posted any jobs yet.</p>
                        <Link to="/recruiter/jobs/create" style={styles.emptyBtn}>Post Your First Job</Link>
                    </div>
                ) : (
                    <div style={styles.jobsList}>
                        {jobs.map(job => (
                            <div key={job._id} style={styles.jobCard}>
                                <div style={styles.jobHeader}>
                                    <div>
                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                        <p style={styles.jobCompany}>{job.company}</p>
                                    </div>
                                    <CategoryBadge category={job.category} />
                                </div>
                                <div style={styles.jobMeta}>
                                    <span>📍 {job.location}</span>
                                    <span>💼 {job.type}</span>
                                    <span>📊 {applicantCounts[job._id] || 0} applicants</span>
                                    <span className={job.status === 'open' ? styles.open : styles.closed}>
                                        {job.status}
                                    </span>
                                </div>
                                <div style={styles.jobActions}>
                                    <Link to={`/recruiter/jobs/${job._id}/edit`} style={styles.editLink}>Edit</Link>
                                    <Link to={`/recruiter/jobs/${job._id}/applicants`} style={styles.applicantsLink}>View Applicants</Link>
                                </div>
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
    container: { maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800 },
    createBtn: { background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' },
    jobsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    jobCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem' },
    jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' },
    jobTitle: { color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 4 },
    jobCompany: { color: '#888', fontSize: 13 },
    jobMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', color: '#666', fontSize: 13 },
    open: { color: '#4ade80' },
    closed: { color: '#f87171' },
    jobActions: { display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '0.5px solid #2a2a2a' },
    editLink: { color: '#7c3aed', textDecoration: 'none', fontSize: 13 },
    applicantsLink: { color: '#60a5fa', textDecoration: 'none', fontSize: 13 },
    emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12 },
    emptyBtn: { display: 'inline-block', background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', marginTop: '1rem' },
    pendingBanner: { textAlign: 'center', padding: '3rem', background: '#13102a', border: '0.5px solid #3d2f7a', borderRadius: 16 },
};

export default RecruiterDashboard;