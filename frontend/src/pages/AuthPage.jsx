import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Briefcase, ChevronRight, Lock, Mail, User } from 'lucide-react';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState(params.get('role') || 'student');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.role === 'officer' ? '/officer' : '/student');
      } else {
        const user = await register({ ...form, role });
        toast.success(`Welcome to ICPMS, ${user.name}!`);
        navigate(role === 'officer' ? '/officer' : '/student');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop") center/cover no-repeat',
      position: 'relative'
    }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(240, 244, 248, 0.9)', backdropFilter: 'blur(8px)' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 54, height: 54, borderRadius: 16,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff',
              boxShadow: '0 8px 24px rgba(15, 98, 254, 0.25)'
            }}>
              IP
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text)', lineHeight: 1.1 }}>
                Campus
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)', lineHeight: 1.1 }}>
                Connect.
              </div>
            </div>
          </Link>
        </div>

        <div className="card" style={{ padding: '40px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
            {mode === 'login' ? "Sign in to access your placement dashboard" : "Join the intelligent placement network"}
          </p>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 6, marginBottom: 32, border: '1px solid var(--border)' }}>
            {['login', 'register'].map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    fontSize: 14, fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize',
                  }}
                >{m === 'login' ? 'Sign In' : 'Register'}</button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-dim)" style={{ position: 'absolute', top: 13, left: 14 }} />
                  <input className="input" style={{ paddingLeft: 42 }} placeholder="Ashika Sharma" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>College Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', top: 13, left: 14 }} />
                <input className="input" style={{ paddingLeft: 42 }} type="email" placeholder="you@college.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', top: 13, left: 14 }} />
                <input className="input" style={{ paddingLeft: 42 }} type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group" style={{ marginTop: 8 }}>
                <label style={{ marginBottom: 12 }}>I am a...</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { value: 'student', label: 'Student', icon: GraduationCap },
                    { value: 'officer', label: 'Placement Officer', icon: Briefcase },
                  ].map((r) => {
                    const isSelected = role === r.value;
                    const Icon = r.icon;
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        style={{
                          flex: 1, padding: '16px 12px', borderRadius: 12, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={24} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 12, justifyContent: 'center', width: '100%', height: 48 }}>
              {loading ? <div className="spinner" /> : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                  <ChevronRight size={18} style={{ marginLeft: 4 }} />
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>
          By continuing, you agree to the CampusConnect Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
