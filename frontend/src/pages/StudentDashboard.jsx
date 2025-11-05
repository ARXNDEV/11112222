import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, UserCircle2, Bed, Users, Phone } from 'lucide-react';

const Video = () => (
  <div className="fixed inset-0 w-full h-full -z-10 opacity-60 pointer-events-none">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      src="https://theromeocollection.com/media/cgxbcanf/romeocollection_hero_16_web.mp4"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60" />
  </div>
);

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Student') {
      navigate('/login');
      return;
    }
    fetchStudentData();
  }, [user, navigate]);

  const fetchStudentData = async () => {
    try {
      // Get all students
      const { data: students } = await api.get('/students');
      
      // Find current student by email
      const currentStudent = students.find(s => s.email === user.email);
      
      if (currentStudent) {
        setStudentInfo(currentStudent);
        
        // Get room info if allocated
        if (currentStudent.roomId) {
          setRoomInfo(currentStudent.roomId);
          
          // Find roommates
          const roomStudents = students.filter(
            s => s.roomId?._id === currentStudent.roomId._id && s._id !== currentStudent._id
          );
          setRoommates(roomStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white animate-fadeinup relative overflow-hidden">
      <Video />

      {/* Header */}
      <header className="relative z-20 bg-black/40 backdrop-blur-lg border-b border-white/10 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle2 className="w-8 h-8 text-[#D3FD50]" />
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-sm text-white/60">Student Dashboard</p>
            </div>
          </div>
          <button
            data-testid="student-logout-btn"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div data-testid="student-profile-card" className="rounded-2xl bg-black/70 border border-white/10 shadow-lg p-8 flex flex-col items-center backdrop-blur-xl hover:border-[#D3FD50]/50 transition-colors">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D3FD50] to-[#222] flex items-center justify-center text-5xl font-bold mb-4 border-4 border-[#D3FD50]/40">
              {user.name[0]}
            </div>
            <div className="text-2xl font-bold mb-1">{user.name}</div>
            <div className="text-sm text-white/60 mb-1">{user.email}</div>
            {studentInfo && (
              <>
                <div className="text-sm text-white/60 mb-1">Student ID: <span className="font-semibold text-white">{studentInfo.studentId}</span></div>
                <div className="text-sm text-white/60 mb-1">Course: <span className="font-semibold text-white">{studentInfo.course}</span></div>
                <div className="text-sm text-white/60">Contact: <span className="font-semibold text-white">{studentInfo.contact}</span></div>
              </>
            )}
          </div>

          {/* Room Information Card */}
          <div data-testid="room-info-card" className="rounded-2xl bg-gradient-to-br from-[#232526] to-[#0f2027] border border-white/10 shadow-xl p-8 flex flex-col backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 text-[#D3FD50] font-bold">
              <Bed className="w-6 h-6" />
              Room Information
            </div>
            {roomInfo ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-white/60">Room Number</div>
                  <div className="text-3xl font-bold text-[#D3FD50]">{roomInfo.roomNumber}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-white/60">Floor</div>
                    <div className="text-xl font-semibold">{roomInfo.floor || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Capacity</div>
                    <div className="text-xl font-semibold">{roomInfo.capacity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Occupied</div>
                    <div className="text-xl font-semibold">{roomInfo.currentOccupancy}</div>
                  </div>
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  roomInfo.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {roomInfo.status}
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                <Bed className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>No room allocated yet</p>
                <p className="text-sm mt-2">Please contact the administrator</p>
              </div>
            )}
          </div>

          {/* Roommates Card */}
          <div data-testid="roommates-card" className="rounded-2xl bg-gradient-to-br from-[#232526] to-[#0f2027] border border-white/10 shadow-xl p-8 flex flex-col backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 text-[#D3FD50] font-bold">
              <Users className="w-6 h-6" />
              Roommates
            </div>
            {roommates.length > 0 ? (
              <div className="space-y-4">
                {roommates.map((roommate) => (
                  <div key={roommate._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D3FD50] to-[#222] flex items-center justify-center text-xl font-bold border-2 border-[#D3FD50]/40">
                        {roommate.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{roommate.name}</div>
                        <div className="text-xs text-white/60">{roommate.course}</div>
                      </div>
                    </div>
                    <a
                      href={`tel:${roommate.contact}`}
                      className="p-2 hover:bg-[#D3FD50]/10 rounded-lg transition-colors text-[#D3FD50]"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>No roommates yet</p>
              </div>
            )}
          </div>

          {/* Quick Info Cards */}
          <div className="rounded-2xl bg-black/70 border border-white/10 shadow-lg p-8 flex flex-col backdrop-blur-xl">
            <div className="text-lg font-bold mb-4 text-[#D3FD50]">Quick Info</div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-white/60">Hostel Contact</div>
                <div className="font-semibold">+91 123-456-7890</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-white/60">Emergency Number</div>
                <div className="font-semibold text-red-400">+91 987-654-3210</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-white/60">Office Hours</div>
                <div className="font-semibold">9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#232526] to-[#0f2027] border border-white/10 shadow-xl p-8 flex flex-col backdrop-blur-xl">
            <div className="text-lg font-bold mb-4 text-[#D3FD50]">Announcements</div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="font-semibold mb-1">Welcome to Hostel Management System</div>
                <div className="text-white/60">Check your room allocation and roommate details here.</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="font-semibold mb-1">Maintenance Schedule</div>
                <div className="text-white/60">Regular maintenance on weekends.</div>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="rounded-2xl bg-black/70 border border-white/10 shadow-lg p-8 flex flex-col backdrop-blur-xl">
            <div className="text-lg font-bold mb-4 text-[#D3FD50]">Need Help?</div>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-[#D3FD50]/10 hover:bg-[#D3FD50]/20 border border-[#D3FD50]/30 rounded-lg transition-colors text-[#D3FD50] font-semibold">
                Report Issue
              </button>
              <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-semibold">
                Contact Warden
              </button>
              <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-semibold">
                View Rules
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
