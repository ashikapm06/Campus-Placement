import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Upload, X, Plus, TrendingUp, CheckCircle, Flame } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHEM', 'BIO', 'MCA', 'MBA'];
// Market Demand Mock Data (Extra Innovation)
const MARKET_DEMAND = {
  'React': { trend: 'hot', growth: '+24%' },
  'Node.js': { trend: 'hot', growth: '+18%' },
  'Python': { trend: 'hot', growth: '+30%' },
  'AWS': { trend: 'hot', growth: '+45%' },
  'SQL': { trend: 'stable', growth: '+5%' },
  'Java': { trend: 'stable', growth: '+2%' },
  'Docker': { trend: 'hot', growth: '+22%' },
  'Machine Learning': { trend: 'hot', growth: '+50%' },
};

const SKILL_SUGGESTIONS = Object.keys(MARKET_DEMAND).concat([
  'JavaScript', 'MongoDB', 'C++', 'Data Structures', 'System Design', 'Git',
  'TypeScript', 'Go', 'Kotlin', 'Swift', 'Flutter', 'Angular', 'Vue.js', 'Django',
]);

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const p = user?.studentProfile || {};

  const [form, setForm] = useState({
    cgpa: p.cgpa || '',
    branch: p.branch || '',
    graduationYear: p.graduationYear || new Date().getFullYear() + 1,
    phone: p.phone || '',
    linkedIn: p.linkedIn || '',
    github: p.github || '',
    skills: p.skills || [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/students/profile', form);
      setUser((u) => ({ ...u, studentProfile: res.data.student.studentProfile }));
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await api.post('/students/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Mocking resume extraction keyword highlighting
      if (res.data.extractedSkills) {
        const newSkills = [...new Set([...form.skills, ...res.data.extractedSkills])];
        setForm(f => ({ ...f, skills: newSkills }));
        toast.success(`Extracted ${res.data.extractedSkills.length} skills from resume!`);
      } else {
        toast.success('Resume uploaded! Text extracted for AI matching.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>My Profile Builder</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete your profile to maximize your AI Match Scores and discoverability.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Main Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Academic Info */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎓 Academic Information
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label>CGPA (out of 10)</label>
                <input className="input" type="number" min="0" max="10" step="0.01"
                  placeholder="8.5" value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Branch / Department</label>
                <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input className="input" type="number" min="2024" max="2030"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* AI Skills Builder */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              💡 Skills Portfolio
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              These are heavily weighted in the AI matching algorithm. The market demand indicator shows current industry trends.
            </p>

            {/* Added skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, minHeight: 44, padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              {form.skills.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>No skills added yet.</span>}
              {form.skills.map((s) => {
                const isHot = MARKET_DEMAND[s]?.trend === 'hot';
                return (
                  <span key={s} className={`badge ${isHot ? 'badge-orange' : 'badge-blue'}`} style={{ padding: '6px 12px', fontSize: 14 }}>
                    {isHot && <Flame size={12} style={{ marginRight: 4 }} />}
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </span>
                )
              })}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input className="input" placeholder="Type a skill and press Enter"
                value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
              <button type="button" className="btn btn-secondary" onClick={() => addSkill(skillInput)}>
                <Plus size={18} /> Add
              </button>
            </div>

            {/* Suggestions */}
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested Based on Market Demand</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 15).map((s) => {
                const demand = MARKET_DEMAND[s];
                return (
                  <button type="button" key={s} onClick={() => addSkill(s)}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                    }}
                    className="hover-border"
                  >
                    <Plus size={14} /> {s}
                    {demand && <span style={{ color: demand.trend === 'hot' ? 'var(--warning)' : 'var(--text-dim)', fontSize: 11, fontWeight: 600 }}>{demand.growth}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Links */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔗 Links & Portfolio
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input className="input" placeholder="linkedin.com/in/..." value={form.linkedIn}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input className="input" placeholder="github.com/..." value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ justifyContent: 'center' }}>
            {saving ? <><div className="spinner" /> Saving Profile...</> : 'Save Profile Changes'}
          </button>
        </form>

        {/* Right Sidebar - Resume AI Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ background: 'var(--accent-light)', borderColor: '#bfdbfe' }}>
            <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--accent)' }}>Resume AI Engine</h3>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16, lineHeight: 1.5 }}>
              Upload your resume to automatically extract skills, calculate keyword matches, and generate Readiness insights.
            </p>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1px dashed #93c5fd', textAlign: 'center', marginBottom: 16 }}>
              <Upload size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload PDF Resume</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Max size: 5MB</div>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
              <button type="button" className="btn btn-sm btn-primary" onClick={() => fileRef.current.click()} disabled={uploading}>
                {uploading ? 'Extracting...' : 'Browse File'}
              </button>
            </div>

            {user?.studentProfile?.resumeUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent3)', fontWeight: 600, background: '#d1fae5', padding: '10px 14px', borderRadius: 8 }}>
                <CheckCircle size={16} /> Resume Processed successfully
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-dim)', marginBottom: 16 }}>
              Market Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef3c7', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Cloud Computing</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>High demand in top companies</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e0eaff', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>React / Node.js</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Highest role availability</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
