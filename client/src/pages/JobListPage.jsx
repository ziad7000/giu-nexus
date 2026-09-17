import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
  });

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      params.append('page', page);
      params.append('limit', 12);
      
      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
      setTotal(response.data.total);
      
      // Update URL
      setSearchParams({ ...filters, page });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      
      <div style={styles.container}>
        <h1 style={styles.title}>Browse Jobs</h1>
        
        {/* Filters */}
        <form onSubmit={handleSearch} style={styles.filters}>
          <input
            style={styles.filterInput}
            type="text"
            placeholder="Job title, company, or keyword"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
          <input
            style={styles.filterInput}
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
          <select
            style={styles.filterSelect}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
          </select>
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>

        {/* Results count */}
        <div style={styles.count}>{total} jobs found</div>

        {/* Job grid */}
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No jobs found matching your criteria</p>
            <button onClick={() => {
              setFilters({ keyword: '', location: '', type: '' });
              setPage(1);
            }} style={styles.clearBtn}>Clear Filters</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{...styles.pageBtn, opacity: page === 1 ? 0.5 : 1}}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{...styles.pageBtn, opacity: page === totalPages ? 0.5 : 1}}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d0d', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none' },
  container: { maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 },
  title: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: '2rem' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterInput: { flex: 2, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  filterSelect: { flex: 1, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  searchBtn: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '0 24px', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  count: { color: '#666', fontSize: 14, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
  clearBtn: { background: '#7c3aed', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: 'pointer', marginTop: '1rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  pageBtn: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer' },
  pageInfo: { color: '#666', fontSize: 14 },
};

export default JobListPage;