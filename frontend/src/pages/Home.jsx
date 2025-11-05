import { Link } from 'react-router-dom';
import { Building2, Users, Bed, Zap } from 'lucide-react';

const Video = () => (
  <div className="fixed inset-0 w-full h-full -z-10">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      src="https://theromeocollection.com/media/cgxbcanf/romeocollection_hero_16_web.mp4"
    />
    <div className="absolute inset-0 bg-black/50" />
  </div>
);

const Home = () => {
  return (
    <div className='text-white'>
      <Video />
      <div className='min-h-screen w-screen relative pb-5 overflow-hidden flex flex-col items-center justify-center px-4'>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-[#D3FD50]" />
            <h1 className="text-2xl font-bold">Hostel Manager</h1>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              data-testid="home-login-btn"
              className="px-6 py-2 rounded-full border-2 border-white/20 hover:border-[#D3FD50] hover:text-[#D3FD50] backdrop-blur-sm transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              data-testid="home-signup-btn"
              className="px-6 py-2 rounded-full bg-[#D3FD50] text-black font-semibold hover:bg-[#D3FD50]/90 transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center space-y-8 mt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Modern Hostel Room
            <br />
            <span className="text-[#D3FD50]">Allocation System</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            Streamline your hostel management with real-time room allocation, student tracking, and comprehensive analytics.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              to="/signup"
              data-testid="home-get-started-btn"
              className="px-8 py-4 rounded-full bg-[#D3FD50] text-black font-bold text-lg hover:bg-[#D3FD50]/90 transition-colors duration-200 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-full border-2 border-white/20 hover:border-[#D3FD50] hover:text-[#D3FD50] backdrop-blur-sm font-bold text-lg transition-colors duration-200"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#D3FD50]/50 transition-colors duration-200">
            <Users className="w-12 h-12 text-[#D3FD50] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Student Management</h3>
            <p className="text-white/70">Complete CRUD operations for student records with course and contact information.</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#D3FD50]/50 transition-colors duration-200">
            <Bed className="w-12 h-12 text-[#D3FD50] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Room Allocation</h3>
            <p className="text-white/70">Efficient room management with capacity tracking and availability status.</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#D3FD50]/50 transition-colors duration-200">
            <Zap className="w-12 h-12 text-[#D3FD50] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Real-time Updates</h3>
            <p className="text-white/70">WebSocket-powered live updates for allocation changes and room status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
