import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>GIU Nexus</span>
        </Link>

        {/* Desktop Navigation - All in one line */}
        <div style={styles.navLinks}>
          <Link to="/jobs" style={styles.navLink}>Jobs</Link>
          
          {isAuthenticated && user?.role === 'jobSeeker' && (
            <>
              <Link to="/jobs/recommended" style={styles.navLink}>Recommended</Link>
              <Link to="/jobs/saved" style={styles.navLink}>Saved Jobs</Link>
              <Link to="/applications/my" style={styles.navLink}>My Applications</Link>
              <Link to="/profile" style={styles.navLink}>Profile</Link>
            </>
          )}
          
          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <Link to="/recruiter/dashboard" style={styles.navLink}>Dashboard</Link>
              <Link to="/recruiter/jobs/create" style={styles.navLinkPrimary}>Post Job</Link>
              <Link to="/profile" style={styles.navLink}>Profile</Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={styles.navLink}>Dashboard</Link>
              <Link to="/admin/users" style={styles.navLink}>Users</Link>
              <Link to="/admin/recruiters" style={styles.navLink}>Recruiters</Link>
              <Link to="/admin/jobs" style={styles.navLink}>Jobs</Link>
            </>
          )}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div style={styles.userMenu}>
              <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(13, 13, 13, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0 2rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #fff, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexWrap: 'nowrap',
  },
  navLink: {
    padding: '0.5rem 0.875rem',
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  navLinkPrimary: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: '0.5rem',
  },
  loginBtn: {
    padding: '0.5rem 1rem',
    color: '#a78bfa',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '8px',
    border: '1px solid rgba(167, 139, 250, 0.3)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  registerBtn: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: '0.5rem',
    paddingLeft: '0.5rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  },
  userName: {
    color: '#e5e7eb',
    fontSize: '13px',
    fontWeight: 500,
  },
  logoutBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    padding: '0.4rem 0.875rem',
    borderRadius: '6px',
    color: '#f87171',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  .login-btn:hover {
    background: rgba(167, 139, 250, 0.1);
    border-color: #a78bfa;
  }
  .register-btn:hover, .nav-link-primary:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
  .logout-btn:hover {
    background: rgba(248, 113, 113, 0.15);
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;