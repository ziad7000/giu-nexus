import { useState } from 'react'
import API from '../services/api'

function SaveJobButton({ jobId, initialSaved = false }) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    // Stop the click from opening the Job Details page
    e.stopPropagation()
    
    if (loading) return

    // 1. OPTIMISTIC UPDATE: Change UI immediately
    const previousState = isSaved
    setIsSaved(!previousState)
    setLoading(true)

    try {

  const res = await API.post(`/jobs/${jobId}/save`)
  setIsSaved(res.data.saved)
  
} catch (err) {
      // 3. ROLLBACK: If API fails, revert to previous state
      setIsSaved(previousState)
      alert('Failed to save job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSave} 
      style={{
        ...styles.btn,
        color: isSaved ? '#7c3aed' : '#555',
        background: isSaved ? 'rgba(124, 58, 237, 0.1)' : 'transparent'
      }}
      title={isSaved ? "Unsave Job" : "Save Job"}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={isSaved ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  )
}

const styles = {
  btn: {
    border: 'none',
    padding: '8px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  }
}

export default SaveJobButton