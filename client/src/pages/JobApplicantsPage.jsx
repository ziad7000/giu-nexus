import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

function JobApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    try {
      const jobRes = await api.get(`/jobs/${jobId}`);
      setJob(jobRes.data.job);

      const appsRes = await api.get(`/jobs/${jobId}/applicants`);
      setApplications(appsRes.data.applications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdating(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(applications.map(app =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!job) return <ErrorAlert message="Job not found" />;

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Applicants for {job.title}</h1>
          <p style={styles.subtitle}>{applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
        </div>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No applicants yet for this position.</p>
          </div>
        ) : (
          <div style={styles.applicantsList}>
            {applications.map(app => (
              <div key={app._id} style={styles.applicantCard}>
                <div style={styles.applicantHeader}>
                  <div style={styles.applicantAvatar}>
                    {app.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={styles.applicantInfo}>
                    <h3 style={styles.applicantName}>{app.user?.name}</h3>
                    <p style={styles.applicantEmail}>{app.user?.email}</p>
                    <div style={styles.skillsContainer}>
                      {app.user?.skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} style={styles.skillChip}>{skill}</span>
                      ))}
                      {app.user?.skills?.length > 5 && (
                        <span style={styles.skillChip}>+{app.user.skills.length - 5}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.statusSection}>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      disabled={updating === app._id}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor:
                          app.status === 'pending' ? '#13102a' :
                          app.status === 'shortlisted' ? '#0a2a1a' : '#1a0a0a',
                        borderColor:
                          app.status === 'pending' ? '#3d2f7a' :
                          app.status === 'shortlisted' ? '#1a5c35' : '#3d1515',
                        color:
                          app.status === 'pending' ? '#a78bfa' :
                          app.status === 'shortlisted' ? '#4ade80' : '#f87171'
                      }}
                    >
                      <option value="pending">📋 Pending</option>
                      <option value="shortlisted">⭐ Shortlisted</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>
                </div>
                {app.coverLetter && (
                  <div style={styles.coverLetter}>
                    <strong>Cover Letter:</strong>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
                <div style={styles.appliedDate}>
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
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
  container: { maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 },
  header: { marginBottom: '2rem' },
  backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  applicantsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  applicantCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem' },
  applicantHeader: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  applicantAvatar: { width: 50, height: 50, background: '#7c3aed', borderRadius: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' },
  applicantInfo: { flex: 2 },
  applicantName: { color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 4 },
  applicantEmail: { color: '#666', fontSize: 13, marginBottom: 8 },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skillChip: { background: '#1e1e1e', padding: '4px 10px', borderRadius: 20, fontSize: 11, color: '#a78bfa' },
  statusSection: { minWidth: 140 },
  statusSelect: { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '0.5px solid' },
  coverLetter: { marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid #2a2a2a', color: '#aaa', fontSize: 13 },
  appliedDate: { marginTop: '0.5rem', color: '#555', fontSize: 12 },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
};

export default JobApplicantsPage;