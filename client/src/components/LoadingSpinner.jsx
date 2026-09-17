import React from 'react';

function LoadingSpinner() {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.spinner} />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  spinner: {
    width: 24,
    height: 24,
    border: '3px solid #1e1e1e',
    borderTop: '3px solid #7c3aed', // Purple color
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default LoadingSpinner;
