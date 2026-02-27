import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Users, Briefcase, Award, TrendingUp, Plus } from 'lucide-react';

// Mock Data for Skill Gap Trend Analytics (Extra Innovation)
const SKILL_GAP_DATA = [
  { name: 'React', campus: 45, market: 85, gap: 40 },
  { name: 'Node.js', campus: 30, market: 75, gap: 45 },
  { name: 'Java', campus: 90, market: 60, gap: -30 }, // Oversupplied
  { name: 'Python', campus: 55, market: 80, gap: 25 },
  { name: 'AWS', campus: 15, market: 65, gap: 50 },
  { name: 'C++', campus: 85, market: 40, gap: -45 }, // Oversupplied
  { name: 'MongoDB', campus: 40, market: 60, gap: 20 },
];

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/drives').then((r) => setDrives(r.data.drives || [])).catch(() => { }),
      api.get('/students/stats').then((r) => setStats(r.data)).catch(() => { }),
    ]).finally(() => setLoading(false));
  }, []);

  const driveStats = {
    total: drives.length,
    active: drives.filter((d) => d.status === 'active').length,
    upcoming: drives.filter((d) => d.status === 'upcoming').length,
    completed: drives.filter((d) => d.status === 'completed').length,
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Placement Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}. Manage drives and monitor campus metrics.</p>
        </div>
        <Link to="/officer/drives/new" className="btn btn-primary btn-lg">
          <Plus size={20} /> Create New Drive
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner"></div></div>
      ) : (
        <>
          {/* Quick Metrics */}
          <div className="grid-4" style={{ marginBottom: 32 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0eaff', color: 'var(--accent)' }}><Users size={24} /></div>
              <div>
                <div className="stat-value">{stats?.total || 0}</div>
                <div className="stat-label">Total Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--accent3)' }}><Award size={24} /></div>
              <div>
                <div className="stat-value">{stats?.placed || 0}</div>
                <div className="stat-label">Students Placed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}><Briefcase size={24} /></div>
              <div>
                <div className="stat-value">{driveStats.active}</div>
                <div className="stat-label">Active Drives</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}><TrendingUp size={24} /></div>
              <div>
                <div className="stat-value">{stats?.total ? `${Math.round((stats.placed / stats.total) * 100)}%` : '0%'}</div>
                <div className="stat-label">Placement Rate</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

            {/* Left Column: Drives Pipeline */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, margin: 0 }}>Active Placement Pipeline</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-green">Active: {driveStats.active}</span>
                  <span className="badge badge-blue">Upcoming: {driveStats.upcoming}</span>
                </div>
              </div>

              {drives.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Briefcase size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <h4>No drives found</h4>
                  <p>Create a placement drive to start recruiting.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {drives.slice(0, 5).map((drive, i) => (
                    <div key={drive._id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="hover-border">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                          background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                        }}>
                          {drive.companyName[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <strong style={{ fontSize: 16 }}>{drive.companyName}</strong>
                            <span className={`badge ${drive.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 11 }}>{drive.status}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {drive.role} • {drive.eligibleStudents?.length || 0} Ranked Candidates
                          </div>
                        </div>
                      </div>
                      <Link to={`/officer/drives/${drive._id}`} className="btn btn-sm btn-secondary">
                        Manage
                      </Link>
                    </div>
                  ))}
                  {drives.length > 5 && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <button className="btn btn-sm" style={{ background: 'none', color: 'var(--accent)' }}>View all {drives.length} drives</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Skill Gap Trend Analytics (Innovation Feature) */}
            <div className="card" style={{ background: '#fafbfc' }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Skill Gap Trend Analytics</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Comparison between campus supply (student skills) and current market demand (job JDs).
              </p>

              <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SKILL_GAP_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(15, 98, 254, 0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="market" name="Market Demand" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="campus" name="Campus Supply" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                <strong>Insight:</strong> High shortage of <span style={{ color: 'var(--danger)', fontWeight: 600 }}>AWS</span> and <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Node.js</span> skills. Consider arranging workshops to improve placement rates in these areas.
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
