import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CategoryBadge from '../components/CategoryBadge';
import SaveJobButton from '../components/SaveJobButton';

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState('');

  useEffect(() => {
    fetchJob();
    if (isAuthenticated && user?.role === 'jobSeeker') {
      checkApplicationStatus();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/my');
      const applied = response.data.applications.some(app => app.job._id === id);
      setHasApplied(applied);
      const app = response.data.applications.find(app => app.job._id === id);
      if (app) setApplicationStatus(app.status);
    } catch (err) {
      console.error('Failed to check application status');
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter });
      setHasApplied(true);
      setApplicationStatus('pending');
      setShowApplyModal(false);
      setCoverLetter('');
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
  setGeneratingCoverLetter(true);
  setCoverLetterError('');
  try {
    const response = await api.post(`/jobs/${id}/cover-letter`);
    setCoverLetter(response.data.coverLetter);
  } catch (err) {
    setCoverLetterError('Failed to generate cover letter. Try again.');
  } finally {
    setGeneratingCoverLetter(false);
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
        <Link to="/jobs" style={styles.backBtn}>← Back to Jobs</Link>
        
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>{job.title}</h1>
              <p style={styles.company}>{job.company}</p>
            </div>
            <div style={styles.actions}>
              <CategoryBadge category={job.category} />
              {isAuthenticated && user?.role === 'jobSeeker' && (
                <SaveJobButton jobId={job._id} />
              )}
            </div>
          </div>

          <div style={styles.meta}>
            <span>📍 {job.location}</span>
            <span>💼 {job.type?.replace('-', ' ')}</span>
            {job.salary && <span>💰 ${job.salary.toLocaleString()}/month</span>}
            <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>

          <div style={styles.section}>
            <h3>Description</h3>
            <p style={styles.description}>{job.description}</p>
          </div>

          <div style={styles.section}>
            <h3>Requirements</h3>
            <ul style={styles.requirements}>
              {job.requirements?.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {isAuthenticated && user?.role === 'jobSeeker' && (
            <div style={styles.applySection}>
              {hasApplied ? (
                <div style={styles.appliedBox}>
                  <div style={styles.appliedIcon}>✅</div>
                  <div>
                    <p style={styles.appliedText}>You have already applied to this position</p>
                    <p style={styles.appliedStatus}>Status: <strong>{applicationStatus}</strong></p>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowApplyModal(true)} style={styles.applyBtn}>
                  Apply Now
                </button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div style={styles.loginPrompt}>
              <p>Please <Link to="/login">login</Link> to apply for this job</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
  <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h3 style={styles.modalTitle}>Apply for {job.title}</h3>
      
      <button
        onClick={handleGenerateCoverLetter}
        disabled={generatingCoverLetter}
        style={styles.generateBtn}
      >
        {generatingCoverLetter ? '✨ Generating...' : '✨ Generate Cover Letter Suggestion'}
      </button>
      
      {coverLetterError && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{coverLetterError}</p>}
      
      <textarea
        style={styles.modalTextarea}
        rows={6}
        placeholder="Write a cover letter (optional) or generate one above..."
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
      />
      <div style={styles.modalButtons}>
        <button onClick={() => setShowApplyModal(false)} style={styles.modalCancel}>Cancel</button>
        <button onClick={handleApply} disabled={applying} style={styles.modalSubmit}>
          {applying ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none' },
  container: { maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 },
  backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
  card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8 },
  company: { color: '#888', fontSize: 16 },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  meta: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingBottom: '1rem', borderBottom: '0.5px solid #2a2a2a', marginBottom: '1.5rem', color: '#666', fontSize: 13 },
  section: { marginBottom: '1.5rem' },
  description: { color: '#aaa', fontSize: 14, lineHeight: 1.6 },
  requirements: { color: '#aaa', fontSize: 14, paddingLeft: '1rem', lineHeight: 1.8 },
  applySection: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid #2a2a2a' },
  applyBtn: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '14px 28px', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%' },
  loginPrompt: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid #2a2a2a', textAlign: 'center', color: '#666' },
  appliedBox: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#0a2a1a', border: '0.5px solid #1a5c35', borderRadius: 12, padding: '1rem' },
  appliedIcon: { fontSize: 32 },
  appliedText: { color: '#4ade80', fontWeight: 500 },
  appliedStatus: { color: '#aaa', fontSize: 13, marginTop: 4 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem', width: '90%', maxWidth: 500 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: '1rem' },
  modalTextarea: { width: '100%', background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, fontFamily: 'inherit', marginBottom: '1rem' },
  modalButtons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  modalCancel: { background: 'transparent', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '10px 20px', color: '#999', cursor: 'pointer' },
  generateBtn: { width: '100%', background: '#13102a', border: '0.5px solid #3d2f7a', color: '#a78bfa', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: '1rem' },
  modalSubmit: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: 'pointer' },
};

export default JobDetailPage;