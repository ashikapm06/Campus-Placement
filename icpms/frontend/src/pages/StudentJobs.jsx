import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { calculateMatchScore } from '../utils/aiScoring';
import MatchScoreRing from '../components/MatchScoreRing';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { Search, MapPin, DollarSign, Calendar, Target, CheckCircle, XCircle } from 'lucide-react';

export default function StudentJobs() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [explainData, setExplainData] = useState(null);

  const profile = user?.studentProfile || {};

  useEffect(() => {
    api.get('/drives')
      .then((r) => setDrives(r.data.drives || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getMatchData = (drive) => {
    return calculateMatchScore(profile, drive);
  };

  const isEligible = (drive) => {
    if (!profile?.cgpa || !profile?.branch) return null;
    const cgpaOk = parseFloat(profile.cgpa) >= (drive.eligibility?.minCGPA || 0);
    const branchOk = !drive.eligibility?.branches?.length || drive.eligibility.branches.includes(profile.branch);
    return cgpaOk && branchOk;
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Browse Opportunities</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {profile?.skills?.length > 0
            ? 'Jobs are ranked by AI Match Score based on your current profile strengths.'
            : '⚡ Complete your profile to see accurate AI match scores!'}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : drives.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <Target size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <h3>No drives posted yet</h3>
          <p>Placement officers haven't posted any drives. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Drive List (Left column) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search/Filter Bar */}
            <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <Search size={18} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search precise roles or companies..."
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 15 }}
              />
            </div>

            {drives.map((drive, i) => {
              const matchData = getMatchData(drive);
              const eligible = isEligible(drive);

              return (
                <div
                  key={drive._id}
                  className="card fade-in"
                  style={{
                    animationDelay: `${i * 0.05}s`, opacity: 0,
                    cursor: 'pointer',
                    borderColor: selectedDrive?._id === drive._id ? 'var(--accent)' : 'var(--border)',
                    boxShadow: selectedDrive?._id === drive._id ? '0 0 0 1px var(--accent)' : undefined,
                  }}
                  onClick={() => setSelectedDrive(drive)}
                >
                  <div style={{ display: 'flex', gap: 20 }}>
                    {/* Logo */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                      background: `var(--accent-light)`, color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                    }}>
                      {drive.companyName[0]}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 18, margin: 0 }}>{drive.companyName}</h3>
                        <span className={`badge ${drive.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{drive.status}</span>
                        {eligible === true && <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Eligible</span>}
                        {eligible === false && <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> Not Eligible</span>}
                      </div>

                      <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 12, fontWeight: 500 }}>{drive.role}</div>

                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={14} /> {drive.ctc}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {drive.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(drive.driveDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--bg)',
                        padding: '12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <MatchScoreRing score={matchData.matchPercentage} size={64} strokeWidth={6} />
                      <button
                        className="btn btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-light)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExplainData(matchData);
                        }}
                      >
                        Why this score?
                      </button>
                    </div>
                  </div>

                  {/* Required skills highlight */}
                  {drive.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: 4 }}>Skills:</span>
                      {drive.requiredSkills.map((s) => {
                        const hasSkill = profile?.skills?.map(x => x.toLowerCase()).includes(s.toLowerCase());
                        return (
                          <span key={s} className={`badge ${hasSkill ? 'badge-green' : 'badge-gray'}`}>
                            {s} {hasSkill && '✓'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky Detail Panel (Right column) */}
          {selectedDrive && (
            <div className="card fade-in" style={{ width: 380, flexShrink: 0, position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, margin: 0 }}>{selectedDrive.companyName}</h2>
                <button
                  onClick={() => setSelectedDrive(null)}
                  style={{ background: 'var(--bg)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: '50%' }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{selectedDrive.role}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, display: 'flex', gap: 12 }}>
                <span>📍 {selectedDrive.location}</span>
                <span>💰 {selectedDrive.ctc}</span>
              </div>

              {/* Explainability Callout */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--accent-light)', borderRadius: 12, marginBottom: 24, cursor: 'pointer', border: '1px solid var(--border)' }}
                onClick={() => setExplainData(getMatchData(selectedDrive))}
              >
                <MatchScoreRing score={getMatchData(selectedDrive).matchPercentage} size={60} strokeWidth={5} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>AI Match Score</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Click to see exact breakdown</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 8 }}>Job Description</h4>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {selectedDrive.jdText}
                </div>
              </div>

              {selectedDrive.rounds?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 12 }}>Selection Rounds</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedDrive.rounds.map((r, i) => (
                      <div key={r} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'var(--text)' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, flexShrink: 0, border: '1px solid var(--border)' }}>
                          {i + 1}
                        </div>
                        <div style={{ paddingTop: 2 }}>{r}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ pading: '16px', background: 'var(--bg)', borderRadius: 8, marginBottom: 24, padding: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-dim)', marginBottom: 4 }}>Drive Date</span>
                    <strong style={{ color: 'var(--text)' }}>{new Date(selectedDrive.driveDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-dim)', marginBottom: 4 }}>Deadline</span>
                    <strong style={{ color: 'var(--text)' }}>{new Date(selectedDrive.applicationDeadline).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-dim)', marginBottom: 4 }}>Min CGPA</span>
                    <strong style={{ color: 'var(--text)' }}>{selectedDrive.eligibility?.minCGPA || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => toast.success('Application submitted! Officer will review your profile.')}
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explainability Panel Modal */}
      {explainData && (
        <ExplainabilityPanel
          scoreData={explainData}
          onClose={() => setExplainData(null)}
        />
      )}
    </div>
  );
}
