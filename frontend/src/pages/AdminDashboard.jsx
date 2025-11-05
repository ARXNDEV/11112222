import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Users, Bed, Plus, Edit, Trash2, X, 
  LayoutDashboard, LogOut, UserCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#D3FD50', '#FF6B6B', '#4ECDC4', '#FFE66D'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', () => {
      fetchRooms();
      fetchStats();
      toast.success('Room created (real-time update)');
    });

    socket.on('room_updated', () => {
      fetchRooms();
      fetchStats();
      toast.success('Room updated (real-time update)');
    });

    socket.on('room_deleted', () => {
      fetchRooms();
      fetchStats();
      toast.success('Room deleted (real-time update)');
    });

    socket.on('student_created', () => {
      fetchStudents();
      toast.success('Student created (real-time update)');
    });

    socket.on('student_updated', () => {
      fetchStudents();
      toast.success('Student updated (real-time update)');
    });

    socket.on('student_deleted', () => {
      fetchStudents();
      toast.success('Student deleted (real-time update)');
    });

    socket.on('allocation_created', () => {
      fetchAllocations();
      fetchRooms();
      fetchStudents();
      fetchStats();
      toast.success('Allocation created (real-time update)');
    });

    socket.on('allocation_completed', () => {
      fetchAllocations();
      fetchRooms();
      fetchStudents();
      fetchStats();
      toast.success('Deallocation completed (real-time update)');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_updated');
      socket.off('room_deleted');
      socket.off('student_created');
      socket.off('student_updated');
      socket.off('student_deleted');
      socket.off('allocation_created');
      socket.off('allocation_completed');
    };
  }, [socket]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRooms(),
        fetchStudents(),
        fetchAllocations(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const { data } = await api.get('/allocations');
      setAllocations(data);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/rooms/stats/summary');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      fetchRooms();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleDeallocate = async (id) => {
    if (!window.confirm('Are you sure you want to deallocate this student?')) return;
    try {
      await api.post(`/allocations/${id}/deallocate`);
      toast.success('Student deallocated');
      fetchAllocations();
      fetchRooms();
      fetchStudents();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deallocate');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#D3FD50]" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-white/60">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-8 h-8" />
              <div>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-white/60">Administrator</div>
              </div>
            </div>
            <button
              data-testid="admin-logout-btn"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-black/20 sticky top-[72px] z-30">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            {['overview', 'rooms', 'students', 'allocations'].map((tab) => (
              <button
                key={tab}
                data-testid={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-[#D3FD50] text-[#D3FD50]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} rooms={rooms} students={students} allocations={allocations} />
        )}
        {activeTab === 'rooms' && (
          <RoomsTab
            rooms={rooms}
            onAdd={() => { setEditingRoom(null); setShowRoomModal(true); }}
            onEdit={(room) => { setEditingRoom(room); setShowRoomModal(true); }}
            onDelete={handleDeleteRoom}
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            onAdd={() => { setEditingStudent(null); setShowStudentModal(true); }}
            onEdit={(student) => { setEditingStudent(student); setShowStudentModal(true); }}
            onDelete={handleDeleteStudent}
          />
        )}
        {activeTab === 'allocations' && (
          <AllocationsTab
            allocations={allocations}
            onAdd={() => setShowAllocationModal(true)}
            onDeallocate={handleDeallocate}
          />
        )}
      </main>

      {/* Modals */}
      {showRoomModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => { setShowRoomModal(false); setEditingRoom(null); }}
          onSuccess={() => { fetchRooms(); fetchStats(); setShowRoomModal(false); setEditingRoom(null); }}
        />
      )}
      {showStudentModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => { setShowStudentModal(false); setEditingStudent(null); }}
          onSuccess={() => { fetchStudents(); setShowStudentModal(false); setEditingStudent(null); }}
        />
      )}
      {showAllocationModal && (
        <AllocationModal
          rooms={rooms}
          students={students}
          onClose={() => setShowAllocationModal(false)}
          onSuccess={() => {
            fetchAllocations();
            fetchRooms();
            fetchStudents();
            fetchStats();
            setShowAllocationModal(false);
          }}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, rooms, students, allocations }) => {
  const chartData = [
    { name: 'Total Rooms', value: stats?.totalRooms || 0 },
    { name: 'Available', value: stats?.availableRooms || 0 },
    { name: 'Occupied', value: stats?.occupiedRooms || 0 },
  ];

  const pieData = [
    { name: 'Available Beds', value: stats?.availableBeds || 0 },
    { name: 'Occupied Beds', value: stats?.totalOccupied || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div data-testid="stat-total-rooms" className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 rounded-2xl border border-blue-500/30">
          <div className="text-blue-400 text-sm font-semibold mb-2">Total Rooms</div>
          <div className="text-4xl font-bold">{stats?.totalRooms || 0}</div>
        </div>
        <div data-testid="stat-available-rooms" className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-6 rounded-2xl border border-green-500/30">
          <div className="text-green-400 text-sm font-semibold mb-2">Available Rooms</div>
          <div className="text-4xl font-bold">{stats?.availableRooms || 0}</div>
        </div>
        <div data-testid="stat-total-students" className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 rounded-2xl border border-purple-500/30">
          <div className="text-purple-400 text-sm font-semibold mb-2">Total Students</div>
          <div className="text-4xl font-bold">{students.length}</div>
        </div>
        <div data-testid="stat-occupied-beds" className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-6 rounded-2xl border border-yellow-500/30">
          <div className="text-yellow-400 text-sm font-semibold mb-2">Occupied Beds</div>
          <div className="text-4xl font-bold">{stats?.totalOccupied || 0}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold mb-4">Room Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Bar dataKey="value" fill="#D3FD50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold mb-4">Bed Occupancy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Allocations */}
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-bold mb-4">Recent Allocations</h3>
        <div className="space-y-3">
          {allocations.slice(0, 5).map((allocation) => (
            <div key={allocation._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="font-semibold">{allocation.studentId?.name}</div>
                <div className="text-sm text-white/60">Room: {allocation.roomId?.roomNumber}</div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  allocation.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {allocation.status}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {new Date(allocation.allocationDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Rooms Tab Component
const RoomsTab = ({ rooms, onAdd, onEdit, onDelete }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold">Rooms Management</h2>
      <button
        data-testid="add-room-btn"
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Room
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <div key={room._id} data-testid={`room-card-${room.roomNumber}`} className="bg-black/40 p-6 rounded-2xl border border-white/10 hover:border-[#D3FD50]/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{room.roomNumber}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                room.status === 'Available' ? 'bg-green-500/20 text-green-400' :
                room.status === 'Occupied' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {room.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                data-testid={`edit-room-${room.roomNumber}`}
                onClick={() => onEdit(room)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                data-testid={`delete-room-${room.roomNumber}`}
                onClick={() => onDelete(room._id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Capacity:</span>
              <span className="font-semibold">{room.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Occupied:</span>
              <span className="font-semibold">{room.currentOccupancy}</span>
            </div>
            {room.floor && (
              <div className="flex justify-between">
                <span className="text-white/60">Floor:</span>
                <span className="font-semibold">{room.floor}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Students Tab Component
const StudentsTab = ({ students, onAdd, onEdit, onDelete }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold">Students Management</h2>
      <button
        data-testid="add-student-btn"
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Student
      </button>
    </div>

    <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-4 text-left">Student ID</th>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Course</th>
            <th className="px-6 py-4 text-left">Contact</th>
            <th className="px-6 py-4 text-left">Room</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id} data-testid={`student-row-${student.studentId}`} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-6 py-4">{student.studentId}</td>
              <td className="px-6 py-4 font-semibold">{student.name}</td>
              <td className="px-6 py-4">{student.course}</td>
              <td className="px-6 py-4">{student.contact}</td>
              <td className="px-6 py-4">
                {student.roomId ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    {student.roomId.roomNumber}
                  </span>
                ) : (
                  <span className="text-white/40">Not Allocated</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    data-testid={`edit-student-${student.studentId}`}
                    onClick={() => onEdit(student)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    data-testid={`delete-student-${student.studentId}`}
                    onClick={() => onDelete(student._id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Allocations Tab Component
const AllocationsTab = ({ allocations, onAdd, onDeallocate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold">Allocations Management</h2>
      <button
        data-testid="add-allocation-btn"
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        New Allocation
      </button>
    </div>

    <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-4 text-left">Student</th>
            <th className="px-6 py-4 text-left">Room</th>
            <th className="px-6 py-4 text-left">Allocation Date</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation) => (
            <tr key={allocation._id} data-testid={`allocation-row-${allocation._id}`} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-6 py-4">
                <div>
                  <div className="font-semibold">{allocation.studentId?.name}</div>
                  <div className="text-xs text-white/60">{allocation.studentId?.studentId}</div>
                </div>
              </td>
              <td className="px-6 py-4 font-semibold">{allocation.roomId?.roomNumber}</td>
              <td className="px-6 py-4">{new Date(allocation.allocationDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  allocation.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {allocation.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {allocation.status === 'Active' && (
                  <button
                    data-testid={`deallocate-btn-${allocation._id}`}
                    onClick={() => onDeallocate(allocation._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                  >
                    Deallocate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Room Modal Component
const RoomModal = ({ room, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    roomNumber: room?.roomNumber || '',
    capacity: room?.capacity || '',
    floor: room?.floor || '',
    status: room?.status || 'Available'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (room) {
        await api.put(`/rooms/${room._id}`, formData);
        toast.success('Room updated');
      } else {
        await api.post('/rooms', formData);
        toast.success('Room created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{room ? 'Edit Room' : 'Add Room'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Room Number</label>
            <input
              data-testid="room-number-input"
              type="text"
              required
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Capacity</label>
            <input
              data-testid="room-capacity-input"
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Floor</label>
            <input
              data-testid="room-floor-input"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              data-testid="room-status-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <button
            data-testid="room-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Student Modal Component
const StudentModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    studentId: student?.studentId || '',
    course: student?.course || '',
    contact: student?.contact || '',
    email: student?.email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (student) {
        await api.put(`/students/${student._id}`, formData);
        toast.success('Student updated');
      } else {
        await api.post('/students', formData);
        toast.success('Student created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{student ? 'Edit Student' : 'Add Student'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              data-testid="student-name-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Student ID</label>
            <input
              data-testid="student-id-input"
              type="text"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
              disabled={!!student}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Course</label>
            <input
              data-testid="student-course-input"
              type="text"
              required
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Contact</label>
            <input
              data-testid="student-contact-input"
              type="text"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              data-testid="student-email-input"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
              disabled={!!student}
            />
          </div>
          <button
            data-testid="student-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Allocation Modal Component
const AllocationModal = ({ rooms, students, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    roomId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const availableRooms = rooms.filter(room => room.currentOccupancy < room.capacity);
  const unallocatedStudents = students.filter(student => !student.currentAllocation);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/allocations', formData);
      toast.success('Allocation created');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">New Allocation</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Select Student</label>
            <select
              data-testid="allocation-student-select"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            >
              <option value="">Choose a student</option>
              {unallocatedStudents.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Select Room</label>
            <select
              data-testid="allocation-room-select"
              required
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            >
              <option value="">Choose a room</option>
              {availableRooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} (Available: {room.capacity - room.currentOccupancy})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
            <textarea
              data-testid="allocation-notes-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg focus:border-[#D3FD50] focus:outline-none"
            />
          </div>
          <button
            data-testid="allocation-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D3FD50] text-black font-bold rounded-lg hover:bg-[#D3FD50]/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Allocating...' : 'Create Allocation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
