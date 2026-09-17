import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

function CreateJobPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        type: 'full-time',
        salary: '',
        totalSlots: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Convert requirements string to array
        const requirementsArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);

        try {
            const response = await api.post('/jobs', {
                ...formData,
                requirements: requirementsArray,
                salary: formData.salary ? parseInt(formData.salary) : undefined
            });
            navigate(`/jobs/${response.data.job._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    if (user?.status === 'pending') {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.pendingBanner}>
                        <h1>⏳ Account Pending Approval</h1>
                        <p>Wait for admin approval before posting jobs.</p>
                        <Link to="/recruiter/dashboard">Back to Dashboard</Link>
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
                    <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
                    <h1 style={styles.title}>Post a New Job</h1>
                    <p style={styles.subtitle}>The AI will automatically assign a category based on your description</p>
                </div>

                <div style={styles.card}>
                    <ErrorAlert message={error} />
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Job Title *</label>
                            <input style={styles.input} name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Company Name *</label>
                            <input style={styles.input} name="company" value={formData.company} onChange={handleChange} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Description *</label>
                            <textarea style={styles.textarea} name="description" rows={5} value={formData.description} onChange={handleChange} required />
                            <p style={styles.hint}>The AI will analyze this description to assign a category (Frontend, Backend, AI/ML, DevOps, Data Engineering, or Other)</p>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Requirements * (comma-separated)</label>
                            <input style={styles.input} name="requirements" placeholder="React, Node.js, MongoDB" value={formData.requirements} onChange={handleChange} required />
                        </div>
                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Location *</label>
                                <input style={styles.input} name="location" placeholder="Cairo or Remote" value={formData.location} onChange={handleChange} required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Job Type *</label>
                                <select style={styles.input} name="type" value={formData.type} onChange={handleChange}>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                        </div>
                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Salary (optional)</label>
                                <input style={styles.input} name="salary" type="number" placeholder="Monthly salary" value={formData.salary} onChange={handleChange} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Open Positions</label>
                                <input style={styles.input} name="totalSlots" type="number" min="1" value={formData.totalSlots} onChange={handleChange} />
                            </div>
                        </div>
                        <div style={styles.buttons}>
                            <button type="submit" style={styles.submitBtn} disabled={loading}>
                                {loading ? 'Creating...' : 'Post Job'}
                            </button>
                            <Link to="/recruiter/dashboard" style={styles.cancelBtn}>Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#0d0d0d', padding: '2rem', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none' },
    orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none' },
    container: { maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { marginBottom: '2rem' },
    backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 8 },
    subtitle: { color: '#666', fontSize: 14 },
    card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2rem' },
    field: { marginBottom: '1.5rem' },
    row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    label: { display: 'block', color: '#999', fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase' },
    input: { width: '100%', background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, outline: 'none' },
    textarea: { width: '100%', background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
    hint: { color: '#555', fontSize: 12, marginTop: 6 },
    buttons: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
    submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
    cancelBtn: { background: 'transparent', border: '0.5px solid #2a2a2a', color: '#999', borderRadius: 8, padding: '12px 24px', textDecoration: 'none' },
    pendingBanner: { textAlign: 'center', padding: '3rem', background: '#13102a', borderRadius: 16 },
};

export default CreateJobPage;