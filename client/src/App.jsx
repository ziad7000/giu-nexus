import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateJobPage from './pages/CreateJobPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import RecommendedJobsPage from './pages/RecommendedJobsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import EditJobPage from './pages/EditJobPage';
import JobApplicantsPage from './pages/JobApplicantsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRecruitersPage from './pages/AdminRecruitersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminJobsPage from './pages/AdminJobsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* The Navbar needs to be inside BrowserRouter to work */}
        <Navbar /> 
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          
          {/* Member 5 Routes */}
          <Route path="/jobs/recommended" element={<RecommendedJobsPage />} />
          <Route path="/jobs/saved" element={<SavedJobsPage />} />
          
          {/* Member 6 Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />

          {/* Member 7 Application Routes */}
          <Route path="/recruiter/jobs/:id/edit" element={<EditJobPage />} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
          <Route path="/applications/my" element={<MyApplicationsPage />} />

          {/* Member 8 Admin Routes */}
          {/* Member 8 Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/recruiters" element={<AdminRecruitersPage />} />

          {/* Member 9 Admin Routes */}
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
    
}

export default App;
