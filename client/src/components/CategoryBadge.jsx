const categoryColors = {
  'Frontend':         { bg: '#0a2a1a', border: '#1a5c35', color: '#4ade80' },
  'Backend':          { bg: '#0a1a2a', border: '#1a3d5c', color: '#60a5fa' },
  'AI/ML':            { bg: '#1a0a2a', border: '#3d1a5c', color: '#c084fc' },
  'DevOps':           { bg: '#0a2a2a', border: '#1a5c5c', color: '#2dd4bf' },
  'Data Engineering': { bg: '#2a1a0a', border: '#5c3d1a', color: '#fb923c' },
  'Other':            { bg: '#1a1a1a', border: '#3a3a3a', color: '#9ca3af' },
}

function CategoryBadge({ category }) {
  const c = categoryColors[category] || categoryColors['Other']
  return (
    <span style={{
      background: c.bg,
      border: `0.5px solid ${c.border}`,
      color: c.color,
      borderRadius: 20,
      padding: '3px 12px',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }}>
      {category}
    </span>
  )
}

export default CategoryBadge