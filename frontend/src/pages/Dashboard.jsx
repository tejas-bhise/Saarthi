import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [filterTutor, setFilterTutor] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [studyGoal, setStudyGoal] = useState(localStorage.getItem('studyGoal') || '10');
  const [quickNote, setQuickNote] = useState('');
  const [notesFilter, setNotesFilter] = useState('all');
  const [heatmapFilter, setHeatmapFilter] = useState('6m');
  const [notesKey, setNotesKey] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [backClickCount, setBackClickCount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadSessions();
    
    // Add entry to history to control back button
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      
      setBackClickCount(prev => {
        const newCount = prev + 1;
        
        if (newCount >= 2) {
          // Show logout confirmation on 2nd or 3rd back click
          setShowLogoutConfirm(true);
          return 0; // Reset count
        }
        
        // First back click - stay frozen on dashboard
        return newCount;
      });
    };

    window.addEventListener('popstate', handlePopState);

    // Reset back click count after 2 seconds of no activity
    const resetTimer = setTimeout(() => {
      setBackClickCount(0);
    }, 2000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(resetTimer);
    };
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sessions loaded:', data);
        setSessions(data);
      } else {
        console.error('❌ Failed to load sessions:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth', { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
    setBackClickCount(0);
  };

  const handleStartSession = (tutorId, subject) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🚀 Starting NEW session with tutorId:', tutorId, 'subject:', subject);
    navigate(`/video/${roomId}`, { 
      state: { 
        tutorId: tutorId, 
        subject: subject, 
        resuming: false 
      }
    });
  };

  const handleResumeSession = (session) => {
    navigate(`/video/${session.session_id}`, { 
      state: { 
        tutorId: session.tutor_id,
        subject: session.subject, 
        resuming: true 
      }
    });
  };

  const handleSaveGoal = () => {
    localStorage.setItem('studyGoal', studyGoal);
    alert('Weekly goal updated!');
  };

  const handleSaveNote = () => {
    if (!quickNote.trim()) return;
    const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
    notes.unshift({
      id: Date.now(),
      text: quickNote,
      date: new Date().toISOString()
    });
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    setQuickNote('');
    setNotesKey(prev => prev + 1);
    alert('Note saved!');
  };

  const handleDeleteNote = (noteId) => {
    const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
    const filtered = notes.filter(n => n.id !== noteId);
    localStorage.setItem('quickNotes', JSON.stringify(filtered));
    setNotesKey(prev => prev + 1);
  };

  const tutors = [
    { 
      id: 'omkar_ai',
      name: 'Omkar', 
      subject: 'AI & Machine Learning', 
      description: 'Expert in Artificial Intelligence and Machine Learning', 
      specialty: 'Neural Networks, Deep Learning, NLP',
      rating: 4.9,
      students: 234
    },
    { 
      id: 'priya_biology',
      name: 'Priya', 
      subject: 'Biology', 
      description: 'Passionate Biology tutor specializing in life sciences', 
      specialty: 'Genetics, Cell Biology, Physiology',
      rating: 4.8,
      students: 189
    }
  ];

  // FIXED: Accurate study hours calculation based on actual session durations
  const calculateStudyHours = () => {
    if (sessions.length === 0) return '0.0';
    
    // Assuming each session is 30 minutes (0.5 hours)
    // If you have actual duration data in sessions, use that instead
    const totalMinutes = sessions.reduce((sum, session) => {
      // If session has duration field, use it: session.duration
      // Otherwise default to 30 minutes per session
      return sum + (session.duration || 30);
    }, 0);
    
    return (totalMinutes / 60).toFixed(1);
  };

  // FIXED: Accurate streak calculation based on consecutive days
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Get unique dates (YYYY-MM-DD format)
    const uniqueDates = [...new Set(
      sortedSessions.map(s => new Date(s.created_at).toISOString().split('T')[0])
    )].sort().reverse();
    
    if (uniqueDates.length === 0) return 0;
    
    // Check if most recent session was today or yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0; // Streak broken
    }
    
    // Count consecutive days
    let streak = 0;
    let currentDate = new Date(uniqueDates[0]);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      if (uniqueDates[i] === expectedDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  const totalHours = calculateStudyHours();

  const getFilteredSessions = () => {
    return sessions.filter(session => {
      const matchesTutor = filterTutor === 'all' || 
        (filterTutor === 'omkar' && session.tutor_id === 'omkar_ai') ||
        (filterTutor === 'priya' && session.tutor_id === 'priya_biology');
      
      const sessionDate = new Date(session.created_at);
      const now = new Date();
      let matchesPeriod = true;
      
      if (filterPeriod === '7d') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = sessionDate >= weekAgo;
      } else if (filterPeriod === '1m') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesPeriod = sessionDate >= monthAgo;
      } else if (filterPeriod === '3m') {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        matchesPeriod = sessionDate >= threeMonthsAgo;
      }
      
      const matchesSearch = searchTerm === '' || 
        session.tutor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.tutor_id === 'omkar_ai' && 'ai machine learning neural'.includes(searchTerm.toLowerCase())) ||
        (session.tutor_id === 'priya_biology' && 'biology cell dna genetics'.includes(searchTerm.toLowerCase()));
      
      return matchesTutor && matchesPeriod && matchesSearch;
    });
  };

  const filteredSessions = getFilteredSessions();

  const getLast7DaysActivity = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = sessions.filter(s => 
        new Date(s.created_at).toISOString().split('T')[0] === date
      ).length;
      return { date, count };
    });
  };

  const weeklyActivity = getLast7DaysActivity();

  const getFilteredNotes = () => {
    const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
    
    if (notesFilter === 'all') return notes;
    
    const now = new Date();
    return notes.filter(note => {
      const noteDate = new Date(note.date);
      
      if (notesFilter === 'today') {
        return noteDate.toDateString() === now.toDateString();
      } else if (notesFilter === '7d') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return noteDate >= weekAgo;
      } else if (notesFilter === '1m') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return noteDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredNotes = getFilteredNotes();

  const getHeatmapData = () => {
    const today = new Date();
    let daysBack = 180;
    
    if (heatmapFilter === '7d') daysBack = 7;
    if (heatmapFilter === '1m') daysBack = 30;
    if (heatmapFilter === '3m') daysBack = 90;
    if (heatmapFilter === '6m') daysBack = 180;
    
    const startDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const heatmapData = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = sessions.filter(s => 
        new Date(s.created_at).toISOString().split('T')[0] === dateStr
      ).length;
      
      heatmapData.push({
        date: dateStr,
        count: count,
        month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
        day: currentDate.getDay()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return heatmapData;
  };

  const heatmapData = getHeatmapData();

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-indigo-500/30';
    if (count === 2) return 'bg-indigo-500/60';
    if (count >= 3) return 'bg-indigo-500';
    return 'bg-white/5';
  };

  const renderTutorsView = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Choose Your AI Tutor</h2>
        <p className="text-sm text-slate-400">Start a personalized learning session</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tutors.map((tutor) => (
          <div 
            key={tutor.id}
            className="group relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:border-indigo-500/50 cursor-pointer"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
            onClick={() => handleStartSession(tutor.id, tutor.subject)}
          >
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-400">Online</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-1">{tutor.name}</h3>
              <p className="text-sm text-indigo-400 font-medium mb-3">{tutor.subject}</p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-semibold">{tutor.rating}</span>
                </div>
                <span className="text-slate-400">{tutor.students} students</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{tutor.description}</p>

            <div className="mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Specialties</div>
              <div className="flex flex-wrap gap-1.5">
                {tutor.specialty.split(', ').map((spec, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 text-slate-300 rounded text-xs border border-white/10">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              Start Session
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotesView = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Notes</h2>
        <p className="text-sm text-slate-400">Capture your learning insights</p>
      </div>

      <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-6"
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <h3 className="text-sm font-semibold text-white mb-3">Quick Note</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveNote()}
            placeholder="What did you learn today?"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            onClick={handleSaveNote}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg transition-all duration-300"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'All' },
          { value: 'today', label: 'Today' },
          { value: '7d', label: 'Week' },
          { value: '1m', label: 'Month' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setNotesFilter(value)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              notesFilter === value
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <h4 className="text-base font-medium text-slate-300 mb-1">No notes yet</h4>
          <p className="text-sm text-slate-500">Start capturing your learning moments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300"
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-white leading-relaxed mb-2">{note.text}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(note.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistoryView = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Session History</h2>
        <p className="text-sm text-slate-400">Review your past sessions</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <select
          value={filterTutor}
          onChange={(e) => setFilterTutor(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
        >
          <option value="all">All Tutors</option>
          <option value="omkar">Omkar</option>
          <option value="priya">Priya</option>
        </select>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 border-3 border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-slate-300">Loading sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <h4 className="text-base font-medium text-slate-300 mb-1">
            {sessions.length === 0 ? 'No sessions yet' : 'No matching sessions'}
          </h4>
          <p className="text-sm text-slate-500">
            {sessions.length === 0 
              ? 'Start your first learning session'
              : 'Try different filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const tutorName = session.tutor_id === 'omkar_ai' ? 'Omkar' : 'Priya';
            const subject = session.tutor_id === 'omkar_ai' ? 'AI & ML' : 'Biology';
            
            return (
              <div 
                key={session.session_id}
                className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300"
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      {tutorName} • {subject}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        30 min
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {session.message_count}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResumeSession(session)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    Resume
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDashboardView = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">
          Welcome back, {user?.name || 'Student'}
        </h2>
        <p className="text-sm text-slate-400">Here's your learning progress</p>
      </div>

      {/* FIXED: Hero Card - Opens AI Tutors section instead of direct session */}
      <div 
        className="mb-6 relative bg-gradient-to-br from-indigo-500/20 to-purple-500/10 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
        style={{
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 60px rgba(99, 102, 241, 0.1)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
        onClick={() => setActiveView('tutors')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Today's Focus</div>
            <h3 className="text-lg font-bold text-white mb-1">Continue Your Learning Journey</h3>
            <p className="text-sm text-slate-300">You've studied {totalHours} hours this week</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg">
            Choose Tutor
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{sessions.length}</div>
          <div className="text-xs font-medium text-slate-400">Sessions Completed</div>
        </div>

        <div className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalHours}</div>
          <div className="text-xs font-medium text-slate-400">Hours Studied</div>
        </div>

        <div className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            animation: streak > 0 ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{streak}</div>
          <div className="text-xs font-medium text-slate-400">Day Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-white mb-1">Weekly Activity</h3>
            <p className="text-xs text-slate-400">Your last 7 days</p>
          </div>
          
          <div className="relative h-40">
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 pr-3 font-medium">
              <span>{Math.max(...weeklyActivity.map(d => d.count))}</span>
              <span>{Math.floor(Math.max(...weeklyActivity.map(d => d.count)) / 2)}</span>
              <span>0</span>
            </div>
            
            <div className="ml-8 h-full flex items-end justify-between gap-2 pb-8">
              {weeklyActivity.map((day, idx) => {
                const maxCount = Math.max(...weeklyActivity.map(d => d.count), 1);
                const heightPercent = (day.count / maxCount) * 100;
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full group">
                    <div className="w-full flex-1 flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-500 hover:to-indigo-300 transition-all duration-300 cursor-pointer relative hover:scale-105"
                        style={{ 
                          height: day.count > 0 ? `${heightPercent}%` : '4px', 
                          opacity: day.count > 0 ? 1 : 0.2,
                          boxShadow: day.count > 0 ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                      >
                        {day.count > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
                            {day.count} session{day.count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{dayName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Goal</h3>
              <p className="text-xs text-slate-400">Keep pushing</p>
            </div>
          </div>
          
          <div className="mb-5">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">Progress</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{totalHours}</span>
                <span className="text-sm text-slate-400 font-medium"> / {studyGoal}h</span>
              </div>
            </div>
            <div className="relative w-full bg-white/5 h-3 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((parseFloat(totalHours) / parseFloat(studyGoal)) * 100, 100)}%`,
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium text-center">
              {Math.min(((parseFloat(totalHours) / parseFloat(studyGoal)) * 100), 100).toFixed(0)}% Complete
            </div>
          </div>
          
          <div className="flex gap-2 mb-3">
            {['2', '4', '6', '10'].map((goal) => (
              <button
                key={goal}
                onClick={() => setStudyGoal(goal)}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  studyGoal === goal
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {goal}h
              </button>
            ))}
          </div>
          <button
            onClick={handleSaveGoal}
            className="w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold rounded-lg transition-all duration-300"
          >
            Update Goal
          </button>
        </div>
      </div>

      {/* FIXED: Heatmap - Made bigger (16px instead of 12px) */}
      <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6"
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Activity Streak</h3>
            <p className="text-xs text-slate-400">Your consistency over time</p>
          </div>
          <div className="flex gap-2">
            {['7d', '1m', '3m', '6m'].map((filter) => (
              <button
                key={filter}
                onClick={() => setHeatmapFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  heatmapFilter === filter
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-0.5 mb-2 ml-10">
              {Array.from(new Set(heatmapData.map(d => d.month))).map((month, idx) => (
                <div key={idx} className="text-xs text-slate-500 font-medium" style={{ minWidth: '50px' }}>
                  {month}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <div className="flex flex-col gap-2 justify-around text-xs text-slate-500 pr-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={idx}>{day}</span>
                ))}
              </div>
              
              <div className="flex-1 grid grid-flow-col gap-2" style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoColumns: '16px' }}>
                {heatmapData.map((day, idx) => (
                  <div
                    key={idx}
                    className={`${getHeatColor(day.count)} rounded hover:ring-2 hover:ring-indigo-400 hover:scale-125 cursor-pointer transition-all duration-200 group relative`}
                    style={{ 
                      gridRow: day.day + 1,
                      width: '16px',
                      height: '16px'
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-5 ml-10">
              <span className="text-xs text-slate-500 font-medium">Less</span>
              <div className="w-4 h-4 bg-white/5 rounded"></div>
              <div className="w-4 h-4 bg-indigo-500/30 rounded"></div>
              <div className="w-4 h-4 bg-indigo-500/60 rounded"></div>
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span className="text-xs text-slate-500 font-medium">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{
      background: 'radial-gradient(1200px circle at top left, #1a1f3c 0%, #0b0f1a 40%, #05070f 100%)'
    }}>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 max-w-md w-full mx-4"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <h3 className="text-lg font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-slate-300 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Toast */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-emerald-500/50 rounded-xl shadow-2xl px-5 py-4 max-w-sm animate-bounce"
          style={{
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Achievement Unlocked</div>
              <div className="text-xs text-emerald-400 mt-0.5">Completed 5 Sessions</div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
        <div className="p-5 border-b border-white/[0.08]">
          <h1 className="text-xl font-bold text-white mb-0.5">Saarthi</h1>
          <p className="text-xs text-slate-400 font-medium">AI Learning Platform</p>
        </div>

        <div className="flex-1 p-3">
          <nav className="space-y-1">
            {[
              { view: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard' },
              { view: 'tutors', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'AI Tutors', badge: true },
              { view: 'history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'History', count: sessions.length },
              { view: 'notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', label: 'Notes', count: JSON.parse(localStorage.getItem('quickNotes') || '[]').length }
            ].map(({ view, icon, label, badge, count }) => (
              <button 
                key={view}
                onClick={() => setActiveView(view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeView === view
                    ? 'bg-gradient-to-r from-indigo-600/80 to-indigo-500/80 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
                {badge && <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                {count !== undefined && count > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-white/10 text-slate-300 text-xs font-semibold rounded">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">This Week</div>
            <div className="space-y-3">
              {[
                { label: 'Sessions', value: sessions.filter(s => {
                  const sessionDate = new Date(s.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return sessionDate >= weekAgo;
                }).length },
                { label: 'Hours', value: `${totalHours}h` },
                { label: 'Streak', value: `${streak}d` }
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-semibold text-base">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-lg mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'Student'}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-3 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" key={notesKey}>
        {activeView === 'dashboard' && renderDashboardView()}
        {activeView === 'tutors' && renderTutorsView()}
        {activeView === 'history' && renderHistoryView()}
        {activeView === 'notes' && renderNotesView()}
      </main>
    </div>
  );
}
