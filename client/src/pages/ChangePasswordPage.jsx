import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

function ChangePasswordPage() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await api.patch('/profile/change-password', { currentPassword, newPassword });
            setSuccess('Password changed successfully!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.orb1} />
            <div style={styles.orb2} />
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/profile" style={styles.backBtn}>← Back to Profile</Link>
                    <h1 style={styles.title}>Change Password</h1>
                </div>
                <div style={styles.card}>
                    <ErrorAlert message={error} />
                    {success && <div style={styles.success}>{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Current Password</label>
                            <input style={styles.input} type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>New Password</label>
                            <input style={styles.input} type="password" placeholder="Enter new password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Confirm New Password</label>
                            <input style={styles.input} type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div style={styles.buttons}>
                            <button type="submit" style={styles.saveBtn} disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
                            <Link to="/profile" style={styles.cancelBtn}>Cancel</Link>
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
    container: { maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { marginBottom: '2rem' },
    backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800 },
    card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2rem' },
    field: { marginBottom: '1.5rem' },
    label: { display: 'block', color: '#999', fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' },
    input: { width: '100%', background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
    buttons: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
    saveBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
    cancelBtn: { background: 'transparent', border: '0.5px solid #2a2a2a', color: '#999', borderRadius: 8, padding: '12px 24px', fontSize: 14, textDecoration: 'none', textAlign: 'center' },
    success: { background: '#0a2a1a', border: '0.5px solid #1a5c35', color: '#4ade80', padding: '12px', borderRadius: 8, marginBottom: '1rem' },
};

export default ChangePasswordPage;