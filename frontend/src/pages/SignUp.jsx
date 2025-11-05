import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginVideo = () => (
  <div className="fixed inset-0 w-full h-full -z-10">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      src="https://theromeocollection.com/media/cgxbcanf/romeocollection_hero_16_web.mp4"
    />
  </div>
);

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'Admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = () => {
    const e = {};
    if (!name) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Confirm your password';
    if (password && confirmPassword && password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const userData = await signup(name, email, password);
      navigate(userData.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <LoginVideo />
      <div className="absolute inset-0 bg-gradient-to-br from-black/12 to-transparent pointer-events-none z-0" />
      
      <button
        data-testid="back-home-btn"
        aria-label="Back to home"
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 z-30 text-white/80 hover:text-[#D3FD50] bg-transparent hover:bg-[#D3FD50]/10 px-3 py-2 rounded-full backdrop-blur border border-black transition-colors duration-200"
      >
        ← Home
      </button>
      
      <div className="relative z-10 w-full max-w-3xl p-20 rounded-[2.5rem] backdrop-blur-2xl bg-transparent border-2 border-black/40 shadow-2xl flex flex-col items-center gap-10 transition duration-300 hover:shadow-black/40">
        <div className="flex flex-col items-center w-full mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white/80 mb-2 tracking-wide">Create Account</h1>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-wider">Sign Up</h2>
        </div>
        
        <form className="w-full flex flex-col gap-8" onSubmit={onSubmit} noValidate>
          <label className="flex flex-col">
            <span className="sr-only">Name</span>
            <input
              data-testid="signup-name-input"
              ref={nameRef}
              type="text"
              aria-label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className={`w-full px-6 py-4 text-lg rounded-xl bg-transparent border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-black/40 transition ${errors.name ? 'ring-2 ring-red-400/40' : ''}`}
            />
            {errors.name && <div className="mt-2 text-sm text-red-300">{errors.name}</div>}
          </label>
          
          <label className="flex flex-col">
            <span className="sr-only">Email</span>
            <input
              data-testid="signup-email-input"
              type="email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`w-full px-6 py-4 text-lg rounded-xl bg-transparent border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-black/40 transition ${errors.email ? 'ring-2 ring-red-400/40' : ''}`}
            />
            {errors.email && <div className="mt-2 text-sm text-red-300">{errors.email}</div>}
          </label>
          
          <label className="flex flex-col relative">
            <span className="sr-only">Password</span>
            <input
              data-testid="signup-password-input"
              type={showPassword ? 'text' : 'password'}
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full px-6 py-4 text-lg rounded-xl bg-transparent border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-black/40 transition ${errors.password ? 'ring-2 ring-red-400/40' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors.password && <div className="mt-2 text-sm text-red-300">{errors.password}</div>}
          </label>
          
          <label className="flex flex-col relative">
            <span className="sr-only">Confirm Password</span>
            <input
              data-testid="signup-confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              aria-label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={`w-full px-6 py-4 text-lg rounded-xl bg-transparent border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-black/40 transition ${errors.confirmPassword ? 'ring-2 ring-red-400/40' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
            {errors.confirmPassword && <div className="mt-2 text-sm text-red-300">{errors.confirmPassword}</div>}
          </label>
          
          <div className="flex items-center justify-between w-full">
            <button
              data-testid="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 px-8 py-3 rounded-full border border-black bg-transparent text-white hover:text-[#D3FD50] hover:bg-[#D3FD50]/10 transition-colors duration-200 text-lg font-semibold uppercase tracking-wider shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            
            <button
              type="button"
              onClick={() => { setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setErrors({}); }}
              className="text-sm text-white/70 hover:text-white"
            >
              Clear
            </button>
          </div>
          
          <div className="w-full text-center mt-2">
            <Link to="/login" className="text-sm text-white/60 hover:text-white">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
