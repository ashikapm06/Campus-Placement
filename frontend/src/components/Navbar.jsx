import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = {
  student: [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/jobs', label: 'Browse Jobs' },
    { to: '/student/profile', label: 'My Profile' },
  ],
  officer: [
    { to: '/officer', label: 'Dashboard' },
    { to: '/officer/drives/new', label: '+ New Drive' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) return null;
  const links = navLinks[user.role] || [];

  return (
    <nav style={{
      background: 'rgba(10,15,30,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,179,237,0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#0a0f1e',
            fontFamily: 'Syne, sans-serif',
          }}>
            IP
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            ICPMS
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname === l.to ? '#38bdf8' : '#94a3b8',
                background: location.pathname === l.to ? 'rgba(56,189,248,0.1)' : 'transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* User info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
