import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Briefcase, MapPin, DollarSign, Calendar, GraduationCap, Code, Layers, FileText, CheckCircle, Plus } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA'];
const SKILL_LIST = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB', 'C++',
  'Machine Learning', 'Data Analysis', 'AWS', 'Docker', 'Git', 'TypeScript', 'Spring Boot', 'Django'
];
const ROUND_LIST = [
  'Online Aptitude Test', 'Group Discussion', 'Technical Interview Round 1',
  'Technical Interview Round 2', 'HR Interview', 'System Design Round', 'Coding Round'
];

export default function CreateDrive() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    role: '',
    jdText: '',
    ctc: '',
    location: '',
    driveDate: '',
    applicationDeadline: '',
    eligibility: { minCGPA: 6.0, branches: [], graduationYear: 2025, maxBacklogs: 0 },
    requiredSkills: [],
    rounds: [],
  });

  const toggleBranch = (b) => {
    const branches = form.eligibility.branches.includes(b)
      ? form.eligibility.branches.filter((x) => x !== b)
      : [...form.eligibility.branches, b];
    setForm((f) => ({ ...f, eligibility: { ...f.eligibility, branches } }));
  };

  const toggleSkill = (s) => {
    const skills = form.requiredSkills.includes(s)
      ? form.requiredSkills.filter((x) => x !== s)
      : [...form.requiredSkills, s];
    setForm((f) => ({ ...f, requiredSkills: skills }));
  };

  const toggleRound = (r) => {
    const rounds = form.rounds.includes(r)
      ? form.rounds.filter((x) => x !== r)
      : [...form.rounds, r];
    setForm((f) => ({ ...f, rounds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.role || !form.jdText) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/drives', form);
      toast.success('Drive created successfully!');
      navigate(`/officer/drives/${res.data.drive._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Post a Placement Drive</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Set up the drive requirements. The AI engine will strictly enforce eligibility rules and rank candidates by Match Score.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section 1: Basic Information */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <Briefcase size={20} color="var(--accent)" /> Basic Information
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label>Company Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" style={{ paddingLeft: 36 }} placeholder="e.g. Google, Microsoft" value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Role / Position <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" style={{ paddingLeft: 36 }} placeholder="e.g. Software Engineer" value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>CTC / Package</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" style={{ paddingLeft: 36 }} placeholder="e.g. 12-18 LPA" value={form.ctc}
                    onChange={(e) => setForm({ ...form, ctc: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" style={{ paddingLeft: 36 }} placeholder="e.g. Bangalore, Hybrid" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Drive Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" type="date" style={{ paddingLeft: 36 }} value={form.driveDate}
                    onChange={(e) => setForm({ ...form, driveDate: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Application Deadline <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--text-dim)" style={{ position: 'absolute', top: 12, left: 12 }} />
                  <input className="input" type="date" style={{ paddingLeft: 36 }} value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} required />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Job Description */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="var(--accent)" /> Job Description <span style={{ color: 'var(--danger)' }}>*</span>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              This detailed text is used by the AI engine to compute keyword matching scores against student resumes.
            </p>
            <textarea className="input" rows={6} placeholder="We are looking for a Software Engineer with strong problem-solving skills..."
              value={form.jdText} onChange={(e) => setForm({ ...form, jdText: e.target.value })} required />
          </div>

          {/* Section 3: Dynamic Eligibility Policy */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent3)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={20} color="var(--accent3)" /> Strict Eligibility Policy
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Students who do not meet these criteria will be automatically marked as Not Eligible, regardless of AI Match score.
            </p>

            <div className="grid-3" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label>Minimum CGPA cutoff</label>
                <input className="input" type="number" min="0" max="10" step="0.1" value={form.eligibility.minCGPA}
                  onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, minCGPA: parseFloat(e.target.value) } })} />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input className="input" type="number" min="2024" max="2028" value={form.eligibility.graduationYear}
                  onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, graduationYear: parseInt(e.target.value) } })} />
              </div>
              <div className="form-group">
                <label>Max Backlogs Allowed</label>
                <input className="input" type="number" min="0" max="10" value={form.eligibility.maxBacklogs}
                  onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, maxBacklogs: parseInt(e.target.value) } })} />
              </div>
            </div>

            <div className="form-group">
              <label>Eligible Departments (Leave empty to allow all)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {BRANCHES.map((b) => {
                  const isSelected = form.eligibility.branches.includes(b);
                  return (
                    <button type="button" key={b} onClick={() => toggleBranch(b)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        border: `1px solid ${isSelected ? 'var(--accent3)' : 'var(--border)'}`,
                        background: isSelected ? '#d1fae5' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent3)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                      }}>
                      {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />} {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Required Skills */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={20} color="var(--accent)" /> AI Matching Skills Focus
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Select key skills to prioritize in the AI matching algorithm (accounts for 40% of the candidate's final score).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILL_LIST.map((s) => {
                const isSelected = form.requiredSkills.includes(s);
                return (
                  <button type="button" key={s} onClick={() => toggleSkill(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                    }}>
                    {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />} {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Selection Rounds */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} color="var(--accent)" /> Selection Pipeline & Rounds
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROUND_LIST.map((r) => {
                const isSelected = form.rounds.includes(r);
                return (
                  <button type="button" key={r} onClick={() => toggleRound(r)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      border: `1px solid ${isSelected ? '#eab308' : 'var(--border)'}`,
                      background: isSelected ? '#fefce8' : 'var(--bg-card)',
                      color: isSelected ? '#a16207' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                    }}>
                    {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />} {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/officer')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><div className="spinner" /> Provisioning Drive...</> : 'Launch Placement Drive & Rank Students →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
