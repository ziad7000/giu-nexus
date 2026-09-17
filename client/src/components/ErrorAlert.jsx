import React from 'react';

function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div style={styles.box}>
      ⚠️ {message}
    </div>
  );
}

const styles = {
  box: {
    background: '#1a0a0a',
    border: '0.5px solid #3d1515',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#f87171',
    fontSize: 13,
    marginBottom: '1rem',
  }
};

export default ErrorAlert;
