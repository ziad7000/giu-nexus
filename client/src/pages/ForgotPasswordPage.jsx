// Final submission - Member 2
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>📧</div>
          <h1 style={styles.title}>Check your email</h1>
          <p style={styles.subtitle}>We've sent a link to <strong>{email}</strong></p>
          <Link to="/login" style={styles.btn}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.subtitle}>Enter your email to receive a reset link</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#7c3aed', textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: '2rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', color: '#999', fontSize: 12, marginBottom: 6 },
  input: { width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px', color: '#fff', outline: 'none' },
  btn: { width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8, padding: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  successIcon: { fontSize: 48, textAlign: 'center', marginBottom: '1rem' }
};

export default ForgotPasswordPage;