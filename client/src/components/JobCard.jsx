import { useNavigate } from 'react-router-dom'
import CategoryBadge from './CategoryBadge'
import SaveJobButton from './SaveJobButton'

function JobCard({ job }) {
  const navigate = useNavigate()

  return (
    <div onClick={() => navigate(`/jobs/${job._id}`)} style={styles.card}>
      {/* Top Section: Avatar and Actions (Badge + Save) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={styles.companyAvatar}>
          {job.company?.[0]?.toUpperCase()}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CategoryBadge category={job.category} />
          <SaveJobButton jobId={job._id} initialSaved={job.isSaved} />
        </div>
      </div>

      {/* Middle Section: Title and Company */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={styles.jobTitle}>{job.title}</h3>
        <p style={styles.company}>{job.company}</p>
      </div>

      {/* Bottom Section: Meta data */}
      <div style={styles.meta}>
        <span style={styles.metaItem}>📍 {job.location}</span>
        <span style={styles.metaItem}>💼 {job.type}</span>
      </div>

      {/* AI Score Section (Only shows if score exists) */}
      {job.score !== undefined && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em' }}>✨ AI Match</span>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{Math.round(job.score * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(job.score * 100)}%`, background: 'linear-gradient(to right, #7c3aed, #4f46e5)', borderRadius: 4 }} />
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { 
    background: 'rgba(255,255,255,0.03)', 
    border: '0.5px solid rgba(255,255,255,0.05)', 
    borderRadius: 24, 
    padding: 24, 
    cursor: 'pointer',
    position: 'relative', // Ensures children positions are relative to this card
    transition: 'transform 0.2s ease',
  },
  companyAvatar: { 
    width: 48, 
    height: 48, 
    background: 'rgba(255,255,255,0.05)', 
    border: '0.5px solid rgba(255,255,255,0.1)', 
    borderRadius: 16, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#fff', 
    fontWeight: 700, 
    fontSize: 20 
  },
  jobTitle: { color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 4 },
  company: { color: '#888', fontSize: 13 },
  meta: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  metaItem: { color: '#555', fontSize: 12, fontWeight: 500 },
}

export default JobCard