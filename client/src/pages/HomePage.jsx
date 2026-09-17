import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import CategoryBadge from '../components/CategoryBadge'
import JobCard from '../components/JobCard'



function SkeletonCard() {
  return (
    <div style={{ ...styles.card, cursor: 'default' }}>
      <div style={styles.skeletonLine({ width: '40%', height: 20, mb: 12 })} />
      <div style={styles.skeletonLine({ width: '70%', height: 18, mb: 8 })} />
      <div style={styles.skeletonLine({ width: '50%', height: 14, mb: 16 })} />
      <div style={styles.skeletonLine({ width: '90%', height: 12, mb: 0 })} />
    </div>
  )
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [jobs, setJobs] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchJobs = async () => {
    setLoadingJobs(true)
    try {
      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (location) params.append('location', location)
      if (type) params.append('type', type)
      params.append('page', page)
      params.append('limit', 9)
      const res = await api.get(`/jobs?${params}`)
      setJobs(res.data.jobs)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchRecommended = async () => {
    setLoadingRec(true)
    try {
      const res = await api.get('/jobs/recommended')
      setRecommended(res.data.jobs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRec(false)
    }
  }

  useEffect(() => { fetchJobs() }, [page])
  useEffect(() => {
    if (isAuthenticated && user?.role === 'jobSeeker') fetchRecommended()
  }, [isAuthenticated])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.logoDot}><span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>GN</span></div>
          <span style={styles.logoName}>GIU Nexus</span>
        </div>
        <div style={styles.navLinks}>
          {isAuthenticated ? (
  <>
    <span style={styles.navGreet}>Hi, {user?.name?.split(' ')[0]}</span>
    <Link to="/profile" style={styles.navBtn}>Profile</Link>
    <button onClick={logout} style={styles.logoutBtn}>Sign out</button>
  </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Sign in</Link>
              <Link to="/register" style={styles.navBtn}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>AI-Powered Career Platform</div>
        <h1 style={styles.heroTitle}>Find Your Next<br /><span style={styles.heroAccent}>Opportunity</span></h1>
        <p style={styles.heroSub}>Discover jobs matched to your skills using AI-powered recommendations</p>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input style={styles.searchInput} placeholder="Job title or keyword" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <input style={styles.searchInput} placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <select style={styles.searchSelect} value={type} onChange={e => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
          </select>
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>
      </div>

      {/* RECOMMENDED SECTION */}
      {isAuthenticated && user?.role === 'jobSeeker' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>✨ Recommended for You</h2>
            <span style={styles.sectionSub}>Matched to your skills using AI</span>
          </div>
          {loadingRec ? (
            <div style={styles.grid}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : recommended.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No recommendations yet.</p>
              <p style={styles.emptySubText}>Add skills to your profile to get AI-matched job recommendations.</p>
              <Link to="/profile" style={styles.emptyBtn}>Extract Skills from Bio</Link>
            </div>
          ) : (
            <div style={styles.grid}>
              {recommended.slice(0, 3).map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </div>
      )}

      {/* ALL JOBS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>All Jobs</h2>
          <span style={styles.sectionSub}>{total} listings found</span>
        </div>
        {loadingJobs ? (
          <div style={styles.grid}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No jobs found.</p>
            <p style={styles.emptySubText}>Try adjusting your search filters.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}

        {/* PAGINATION */}
        {total > 9 && (
          <div style={styles.pagination}>
            <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={styles.pageInfo}>Page {page} of {Math.ceil(total / 9)}</span>
            <button style={styles.pageBtn} disabled={page >= Math.ceil(total / 9)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #1e1e1e' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 30, height: 30, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoName: { color: '#fff', fontWeight: 700, fontSize: 17 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 12 },
  navGreet: { color: '#666', fontSize: 14 },
  navLink: { color: '#999', fontSize: 14, textDecoration: 'none' },
  navBtn: { background: '#7c3aed', color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' },
  hero: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '5rem 2rem 3rem' },
  heroBadge: { display: 'inline-block', background: '#13102a', border: '0.5px solid #3d2f7a', color: '#a78bfa', borderRadius: 20, padding: '5px 16px', fontSize: 12, fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '0.3px' },
  heroTitle: { color: '#fff', fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-1px' },
  heroAccent: { color: '#7c3aed' },
  heroSub: { color: '#666', fontSize: 16, marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem' },
  searchBar: { display: 'flex', gap: 10, maxWidth: 700, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  searchInput: { flex: 1, minWidth: 160, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  searchSelect: { flex: 1, minWidth: 140, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  searchBtn: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '11px 24px', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  section: { position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 3rem' },
  sectionHeader: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.5rem' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: 700 },
  sectionSub: { color: '#555', fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
 

 

  skeletonLine: ({ width, height, mb }) => ({ width, height, background: '#1e1e1e', borderRadius: 4, marginBottom: mb }),
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 8 },
  emptySubText: { color: '#666', fontSize: 14, marginBottom: '1.5rem' },
  emptyBtn: { display: 'inline-block', background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: '2rem' },
  pageBtn: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' },
  pageInfo: { color: '#666', fontSize: 13 },
  logoutBtn: { background: 'none', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '7px 16px', color: '#666', fontSize: 13, cursor: 'pointer' },
}