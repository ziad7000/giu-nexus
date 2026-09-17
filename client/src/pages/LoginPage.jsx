import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import ErrorAlert from '../components/ErrorAlert'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const response = await api.post('/auth/login', { email, password })
    login(response.data.token, response.data.user)
    navigate('/')
  } catch (err) {
    setError(err.response?.data?.message || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoDot}><span style={styles.logoText}>GN</span></div>
          <span style={styles.logoName}>GIU Nexus</span>
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={styles.forgot}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>
        <p style={styles.registerLink}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 350, height: 350, borderRadius: '50%', background: '#7c3aed', filter: 'blur(100px)', opacity: 0.12, top: -100, left: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 250, height: 250, borderRadius: '50%', background: '#4f46e5', filter: 'blur(80px)', opacity: 0.12, bottom: -80, right: -80, pointerEvents: 'none' },
  card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' },
  logoDot: { width: 32, height: 32, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 800, fontSize: 14 },
  logoName: { color: '#fff', fontWeight: 700, fontSize: 18 },
  title: { color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: '2rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', color: '#999', fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { width: '100%', background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  forgot: { textAlign: 'right', marginTop: -4, marginBottom: '1rem' },
  forgotLink: { color: '#666', fontSize: 12, textDecoration: 'none' },
  btn: { width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8, padding: 13, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: '0.5rem' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '1.25rem 0' },
  dividerLine: { flex: 1, height: 0.5, background: '#2a2a2a' },
  dividerText: { color: '#444', fontSize: 12 },
  registerLink: { textAlign: 'center', color: '#666', fontSize: 13 },
  link: { color: '#7c3aed', textDecoration: 'none', fontWeight: 500 },
}

export default LoginPage