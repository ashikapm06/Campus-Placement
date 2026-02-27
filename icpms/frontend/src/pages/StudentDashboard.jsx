import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { calculateReadiness } from '../utils/aiScoring';
import MatchScoreRing from '../components/MatchScoreRing';
import { Briefcase, FileText, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const profile = user?.studentProfile || {};

  useEffect(() => {
    api.get('/drives')
      .then((r) => setDrives(r.data.drives || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const readinessData = calculateReadiness(profile);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here is your campus placement overview and readiness analysis.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {/* Readiness Score Card */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <MatchScoreRing score={readinessData.index} size={100} strokeWidth={8} />
            <div style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>Readiness Index</div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Profile Insights</h3>

            {readinessData.strengths.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> Strengths
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {readinessData.strengths.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                </div>
              </div>
            )}

            {readinessData.gaps.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> Actionable Gaps
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                  {readinessData.gaps.map((g, i) => <li key={i} style={{ marginBottom: 4 }}>{g}</li>)}
                </ul>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Link to="/student/profile" className="btn btn-sm btn-secondary">Update Profile</Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="stat-icon" style={{ background: '#e0eaff', color: 'var(--accent)', width: 48, height: 48 }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {drives.filter(d => d.status === 'active').length}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Active Drives</div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="stat-icon" style={{ background: '#f3f4f6', color: 'var(--text-muted)', width: 48, height: 48 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {profile?.cgpa || 'N/A'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Current CGPA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Jobs (Mock Integration) */}
      <h3 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={20} color="var(--accent)" /> Top Suggested Opportunities
      </h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner"></div></div>
      ) : drives.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <p>No active drives currently available.</p>
        </div>
      ) : (
        <div className="grid-2">
          {drives.slice(0, 4).map((drive) => (
            <div key={drive._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 4 }}>{drive.companyName}</h4>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{drive.role}</div>
                </div>
                <span className={`badge ${drive.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  {drive.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                <span>💰 {drive.ctc}</span>
                <span>📍 {drive.location}</span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>AI Match Available via Jobs →</div>
                <Link to="/student/jobs" className="btn btn-sm btn-primary">View in Jobs</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
