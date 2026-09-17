import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      const res = await api.patch(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Link expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{success ? 'Success!' : 'Reset Password'}</h1>
        <p style={styles.subtitle}>{success ? 'Redirecting...' : 'Enter new password'}</p>
        <ErrorAlert message={error} />
        {!success && (
          <form onSubmit={handleSubmit}>
            <input style={styles.input} type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div style={{ margin: '10px 0' }} />
            <input style={styles.input} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" style={{ ...styles.btn, marginTop: '20px' }} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: '2rem' },
  input: { width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px', color: '#fff', outline: 'none' },
  btn: { width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8, padding: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }
};

export default ResetPasswordPage;