import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import SkillChip from '../components/SkillChip';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extractError, setExtractError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.user);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleExtractSkills = async () => {
        setExtracting(true);
        setExtractError('');
        try {
            const response = await api.post('/profile/extract-skills');
            setProfile({ ...profile, skills: response.data.skills });
        } catch (err) {
            setExtractError(err.response?.data?.message || 'Failed to extract skills');
        } finally {
            setExtracting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!profile) return <ErrorAlert message={error} />;

    return (
        <div style={styles.page}>
            <div style={styles.orb1} />
            <div style={styles.orb2} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Profile</h1>
                    <div style={styles.actions}>
                        <Link to="/profile/edit" style={styles.editBtn}>Edit Profile</Link>
                        <Link to="/profile/change-password" style={styles.passwordBtn}>Change Password</Link>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.avatar}>
    {profile.profilePicture ? (
        <img src={profile.profilePicture} alt="Profile" style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover' }} />
    ) : (
        profile.name?.charAt(0).toUpperCase()
    )}
</div>
                    <div style={styles.info}>
                        <h2 style={styles.name}>{profile.name}</h2>
                        <p style={styles.email}>{profile.email}</p>
                        <p style={styles.role}>
                            Role: <span style={styles.roleBadge}>{profile.role}</span>
                        </p>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Bio</h3>
                        <Link to="/profile/edit" style={styles.editLink}>Edit</Link>
                    </div>
                    <p style={styles.bio}>{profile.bio || 'No bio added yet. Click Edit to add one.'}</p>
                </div>

                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Skills</h3>
                        <button
                            onClick={handleExtractSkills}
                            style={styles.extractBtn}
                            disabled={extracting}
                        >
                            {extracting ? 'Extracting...' : 'Extract Skills from Bio'}
                        </button>
                    </div>
                    {extractError && <ErrorAlert message={extractError} />}
                    <div style={styles.skillsContainer}>
                        {profile.skills?.length > 0 ? (
                            profile.skills.map((skill, i) => (
                                <SkillChip key={i} skill={skill} />
                            ))
                        ) : (
                            <p style={styles.noSkills}>No skills yet. Add a bio and extract skills!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#0d0d0d', padding: '2rem', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none' },
    orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#4f46e5', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none' },
    container: { maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800 },
    actions: { display: 'flex', gap: '1rem' },
    editBtn: { background: '#7c3aed', color: '#fff', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
    passwordBtn: { background: 'transparent', border: '0.5px solid #2a2a2a', color: '#999', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14 },
    card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' },
    avatar: { width: 80, height: 80, background: '#7c3aed', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: '1rem' },
    info: { textAlign: 'center' },
    name: { color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4 },
    email: { color: '#666', fontSize: 14, marginBottom: 8 },
    role: { color: '#888', fontSize: 13 },
    roleBadge: { background: '#1e1e1e', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#a78bfa' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 600 },
    editLink: { color: '#7c3aed', fontSize: 13, textDecoration: 'none' },
    bio: { color: '#aaa', fontSize: 14, lineHeight: 1.6 },
    extractBtn: { background: '#13102a', border: '0.5px solid #3d2f7a', color: '#a78bfa', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' },
    skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: '1rem' },
    noSkills: { color: '#666', fontSize: 13 },
};

export default ProfilePage;