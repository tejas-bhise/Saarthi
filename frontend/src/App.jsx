import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { CompanionsPage } from './pages/CompanionsPage';
import { RoomPage } from './pages/RoomPage';
import { VideoCallPage } from './pages/VideoCallPage';
import { isAuthenticated } from './utils/api';

const companionsData = {
  'omkar_ai': { id: 'omkar_ai', name: 'Omkar', subject: 'AI & ML', avatar: '🧑💻' },
  'priya_biology': { id: 'priya_biology', name: 'Priya', subject: 'Biology', avatar: '👩🔬' }
};

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

const VideoCallPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tutorId = location.state?.tutorId || 'omkar_ai';
  const subject = location.state?.subject || 'AI & ML';
  
  const companion = {
    id: tutorId,
    name: tutorId === 'priya_biology' ? 'Priya' : 'Omkar',
    subject: subject
  };

  const handleEndCall = () => {
    // ✅ Just navigate back normally - browser will pop to Dashboard
    navigate('/dashboard');
  };

  return (
    <VideoCallPage 
      companion={companion} 
      onEndCall={handleEndCall} 
    />
  );
};

function CompanionsPageWrapper() {
  const navigate = useNavigate();

  const handleSelectCompanion = (companion) => {
    console.log('✅ Selected companion:', companion.name);
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    localStorage.setItem('userId', userId);
    
    navigate('/room', {
      state: { companion, userId }
    });
  };

  return (
    <>
      <Navbar onBack={() => navigate('/dashboard')} />
      <CompanionsPage onSelectCompanion={handleSelectCompanion} />
    </>
  );
}

function RoomPageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const companion = location.state?.companion || companionsData['omkar_ai'];
  const userId = location.state?.userId || localStorage.getItem('userId') || `user_${Date.now()}`;

  const handleJoinRoom = (roomId) => {
    console.log('✅ Joining room:', roomId);
    navigate(`/video/${roomId}?companion=${companion.id}`, {
      state: { companion, userId, roomId }
    });
  };

  return (
    <>
      <Navbar onBack={() => navigate('/companions')} />
      <RoomPage 
        companion={companion}
        onJoinRoom={handleJoinRoom}
        onBack={() => navigate('/companions')}
      />
    </>
  );
}

function LandingPageWrapper() {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated()) {
      // ✅ Replace to Dashboard if already logged in
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return <LandingPage onGetStarted={() => navigate('/auth')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/companions" 
          element={
            <ProtectedRoute>
              <CompanionsPageWrapper />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/room" 
          element={
            <ProtectedRoute>
              <RoomPageWrapper />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/video/:roomId" 
          element={
            <ProtectedRoute>
              <VideoCallPageWrapper />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
