import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import MatchScoreRing from '../components/MatchScoreRing';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { calculateMatchScore } from '../utils/aiScoring';
import { MapPin, DollarSign, Calendar, GraduationCap, Users, RefreshCw, FileText, Code, CheckCircle, ShieldAlert, Award } from 'lucide-react';

const STATUS_OPTIONS = ['eligible', 'applied', 'shortlisted', 'selected', 'rejected'];

export default function DriveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');

  const [explainData, setExplainData] = useState(null);
  const [overrideModal, setOverrideModal] = useState({ show: false, studentId: null, oldStatus: '', newStatus: '', reason: '' });

  useEffect(() => {
    fetchDrive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDrive = async () => {
    try {
      const res = await api.get(`/drives/${id}`);
      const d = res.data.drive;
      setDrive(d);
      if (d.eligibleStudents?.length > 0) {
        // Recompute exact MatchScores locally for Explainability Panel integration
        const computedStudents = d.eligibleStudents.map((e) => {
          const studentProfile = e.studentId?.studentProfile || {};
          const matchData = calculateMatchScore(studentProfile, d);
          return {
            ...e,
            student: e.studentId,
            computedMatchData: matchData,
            computedScore: matchData.matchPercentage
          };
        });

        // Sort explicitly by computed score descending
        computedStudents.sort((a, b) => b.computedScore - a.computedScore);
        setEligible(computedStudents);
      }
    } catch (err) {
      toast.error('Drive not found');
      navigate('/officer');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEligible = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/drives/${id}/generate-eligible`);
      toast.success(`✨ AI dynamically evaluated profiles and ranked ${res.data.total} eligible students.`);
      fetchDrive(); // Refetch to get populated profiles and run full JS recalculation
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const requestStatusUpdate = (studentId, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;

    // Trigger Governance/Override protocol
    setOverrideModal({
      show: true,
      studentId,
      oldStatus,
      newStatus,
      reason: ''
    });
  };

  const confirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!overrideModal.reason || overrideModal.reason.length < 10) {
      toast.error('A detailed justification (min 10 chars) is required for Audit logging.');
      return;
    }

    try {
      // In a real app we would send the reason to an audit log endpoint
      await api.put(`/drives/${id}/student-status`, {
        studentId: overrideModal.studentId,
        status: overrideModal.newStatus,
        auditReason: overrideModal.reason
      });

      setEligible((prev) => prev.map((e) => e.student?._id === overrideModal.studentId || e.studentId === overrideModal.studentId
        ? { ...e, status: overrideModal.newStatus }
        : e
      ));

      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>Status Updated Successfully</strong>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Audit trail logged for Manual Override.</span>
        </div>
      );
      setOverrideModal({ show: false, studentId: null, oldStatus: '', newStatus: '', reason: '' });

    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'all'
    ? eligible
    : eligible.filter((e) => e.status === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!drive) return null;

  const avgScore = eligible.length > 0
    ? Math.round(eligible.reduce((s, e) => s + (e.computedScore || 0), 0) / eligible.length)
    : 0;

  const selectedCount = eligible.filter((e) => e.status === 'selected').length;
  const shortlistedCount = eligible.filter((e) => e.status === 'shortlisted').length;

  return (
    <div className="fade-in">
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>

        {/* Drive Overview Header */}
        <div className="card" style={{ marginBottom: 24, padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', gap: 24, flex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                background: 'var(--accent-light)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32,
              }}>
                {drive.companyName[0]}
              </div>

              <div>
                <h1 style={{ fontSize: 28, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {drive.companyName}
                  <span className={`badge ${drive.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 13, alignSelf: 'center' }}>
                    {drive.status}
                  </span>
                </h1>

                <div style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 500 }}>
                  {drive.role}
                </div>

                <div style={{ display: 'flex', gap: 20, fontSize: 14, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={16} /> {drive.ctc}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {drive.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {new Date(drive.driveDate).toLocaleDateString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={16} /> CGPA ≥ {drive.eligibility?.minCGPA}</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 300 }}>
              <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code size={16} /> Targeted Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {drive.requiredSkills?.map((s) => (
                  <span key={s} className="badge badge-blue">{s}</span>
                )) || <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>None specified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '20px 24px', background: 'var(--accent-light)', borderRadius: 'var(--radius)', border: '1px solid #bfdbfe' }}>
          <div>
            <h2 style={{ fontSize: 20, color: 'var(--accent)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={22} /> AI Candidate Shortlisting Engine
            </h2>
            <p style={{ color: 'var(--text)', fontSize: 14, margin: 0, opacity: 0.8 }}>
              Automatically analyzes resumes, checks strict policy (CGPA, backlogs), and computes intelligent Match Scores.
            </p>
          </div>
          <button
            onClick={handleGenerateEligible}
            className="btn btn-primary btn-lg"
            disabled={generating}
            style={{ flexShrink: 0, boxShadow: '0 4px 12px rgba(15, 98, 254, 0.2)' }}
          >
            {generating ? (
              <><RefreshCw size={18} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} /> Processing Profiles...</>
            ) : (
              <>⚡ {eligible.length > 0 ? 'Re-run Algorithm' : 'Run Shortlisting Algorithm'}</>
            )}
          </button>
        </div>

        {/* Generated Stats */}
        {eligible.length > 0 && (
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0eaff', color: 'var(--accent)' }}><Users size={24} /></div>
              <div>
                <div className="stat-value">{eligible.length}</div>
                <div className="stat-label">Eligible Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f3f4f6', color: 'var(--text-muted)' }}><RefreshCw size={24} /></div>
              <div>
                <div className="stat-value">{avgScore}%</div>
                <div className="stat-label">Avg Match Score</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}><FileText size={24} /></div>
              <div>
                <div className="stat-value">{shortlistedCount}</div>
                <div className="stat-label">Shortlisted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--accent3)' }}><CheckCircle size={24} /></div>
              <div>
                <div className="stat-value">{selectedCount}</div>
                <div className="stat-label">Waitlisted / Selected</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {eligible.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: 8 }}>Filter View:</span>
            {['all', ...STATUS_OPTIONS].map((f) => {
              const count = f === 'all' ? eligible.length : eligible.filter(e => e.status === f).length;
              const isSelected = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                    textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>
                  {f} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Student Ranked List */}
        {generating ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 24 }}>
            <RefreshCw size={48} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Running Weighted AI Matching</h3>
              <p style={{ color: 'var(--text-muted)' }}>Analyzing skills, academics, and resume keywords strictly against policy constraints.</p>
            </div>
          </div>
        ) : eligible.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🤖</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No candidates processed</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click the "Run Shortlisting Algorithm" button above to populate the candidate list.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            No candidates currently in the "{filter}" status.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', padding: '0 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 4 }}>
              <div style={{ width: 60 }}>Rank</div>
              <div style={{ flex: 1, paddingLeft: 12 }}>Candidate Profile</div>
              <div style={{ width: 140, textAlign: 'center' }}>Match Rate</div>
              <div style={{ width: 180, paddingLeft: 24 }}>Governance Status</div>
            </div>

            {filtered.map((entry, i) => {
              const student = entry.student;
              if (!student) return null;

              const sp = student.studentProfile || {};
              const matchPercentage = entry.computedScore || 0;

              const rank = eligible.findIndex(e => e.student?._id === student._id) + 1;

              return (
                <div key={student._id} className="card fade-in hover-border" style={{
                  animationDelay: `${i * 0.03}s`, opacity: 0,
                  display: 'flex', alignItems: 'center', padding: '16px 24px',
                  background: rank <= 3 ? '#fafbfc' : 'var(--bg-card)',
                  borderColor: rank <= 3 ? '#e5e7eb' : 'var(--border)'
                }}>

                  {/* Rank */}
                  <div style={{
                    width: 60, flexShrink: 0,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
                    color: rank === 1 ? '#eab308' : rank === 2 ? '#9ca3af' : rank === 3 ? '#b45309' : 'var(--text-dim)',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    #{rank} {rank === 1 && '🥇'} {rank === 2 && '🥈'} {rank === 3 && '🥉'}
                  </div>

                  {/* Profile Info */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)',
                    }}>
                      {student.name?.[0] || 'U'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 16 }}>{student.name}</strong>
                        {sp.isPlaced && entry.status !== 'selected' && <span className="badge badge-green" style={{ fontSize: 11 }}>Already Placed</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>{student.email}</span>
                        {sp.branch && <span>• {sp.branch}</span>}
                        {sp.cgpa && <span>• CGPA: <strong style={{ color: 'var(--text)' }}>{sp.cgpa}</strong></span>}
                      </div>
                    </div>
                  </div>

                  {/* Explainable AI Score */}
                  <div style={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                    <MatchScoreRing score={matchPercentage} size={54} strokeWidth={5} />
                    <button
                      className="btn btn-sm"
                      style={{ padding: 0, marginTop: 8, fontSize: 11, background: 'none', color: 'var(--accent)', fontWeight: 600 }}
                      onClick={() => setExplainData(entry.computedMatchData)}
                    >
                      Show Breakdown
                    </button>
                  </div>

                  {/* Governance/Action Dropdown */}
                  <div style={{ width: 180, paddingLeft: 24 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 }}>Decision Status</div>
                    <select
                      value={entry.status}
                      onChange={(e) => requestStatusUpdate(student._id, entry.status, e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', cursor: 'pointer',
                        fontSize: 14, outline: 'none', fontWeight: 500,
                        transition: 'border-color 0.2s',
                        textTransform: 'capitalize'
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Override Audit Modal */}
      {overrideModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldAlert size={24} color="var(--danger)" />
              <h3 style={{ margin: 0, color: '#991b1b', fontSize: 18 }}>Manual Override Requested</h3>
            </div>

            <form onSubmit={confirmStatusUpdate} style={{ padding: '24px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                You are changing this candidate's status from <strong style={{ textTransform: 'capitalize' }}>{overrideModal.oldStatus}</strong> to <strong style={{ textTransform: 'capitalize' }}>{overrideModal.newStatus}</strong>.
                <br /><br />
                To ensure transparent governance and fairness, please provide a justification for this manual override. This will be recorded in the system audit logs.
              </p>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Justification / Reason (min 10 chars) *</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="e.g. Candidate performed exceptionally well in the technical round despite lower initial Match Score..."
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                  style={{ borderColor: overrideModal.reason.length > 0 && overrideModal.reason.length < 10 ? 'var(--danger)' : undefined }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setOverrideModal({ show: false, studentId: null, oldStatus: '', newStatus: '', reason: '' })}>
                  Cancel Edit
                </button>
                <button type="submit" className="btn btn-danger" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}>
                  Log & Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explainability Panel */}
      {explainData && (
        <ExplainabilityPanel
          scoreData={explainData}
          onClose={() => setExplainData(null)}
        />
      )}
    </div>
  );
}
