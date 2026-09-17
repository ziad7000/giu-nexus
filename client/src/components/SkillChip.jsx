function SkillChip({ skill }) {
  return (
    <span style={styles.chip}>
      {skill}
    </span>
  )
}

const styles = {
  chip: {
    display: 'inline-block',
    background: '#13102a',
    border: '0.5px solid #3d2f7a',
    color: '#a78bfa',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 500,
    marginRight: 8,
    marginBottom: 8,
  }
}

export default SkillChip