import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Zap, BarChart3, Users, Network } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff',
            boxShadow: '0 4px 12px rgba(15, 98, 254, 0.2)'
          }}>IP</div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Campus</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>Connect</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/auth" style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none', padding: '8px 16px', transition: 'color 0.2s' }} className="hover-text-accent">Login</Link>
          <Link to="/auth?mode=register" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 8 }}>Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 120 }}>

        <div style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-light)', border: '1px solid #bfdbfe',
            borderRadius: 24, padding: '8px 20px', marginBottom: 32,
            fontSize: 14, fontWeight: 700, color: 'var(--accent)',
            boxShadow: '0 4px 12px rgba(15, 98, 254, 0.05)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Powered by Explainable AI Matching
          </div>

          <h1 className="fade-in fade-in-delay-1" style={{
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24,
            maxWidth: 900, color: '#111827'
          }}>
            The intelligent network for <br />
            <span style={{ color: 'var(--accent)' }}>
              campus placements
            </span>
          </h1>

          <p className="fade-in fade-in-delay-2" style={{ maxWidth: 640, color: 'var(--text-muted)', fontSize: 20, lineHeight: 1.6, marginBottom: 48, fontWeight: 400 }}>
            Connect students with the right opportunities using advanced AI resume parsing, automated eligibility verification, and skill gap trend analytics.
          </p>

          <div className="fade-in fade-in-delay-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/auth?mode=register&role=student" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12 }}>
              Join as Student <ChevronRight size={20} style={{ marginLeft: 4 }} />
            </Link>
            <Link to="/auth?mode=register&role=officer" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12, background: '#fff' }}>
              For Placement Officers
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ padding: '100px 48px', background: '#fff', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Built for Modern Campuses</h2>
              <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>Everything you need to orchestrate placement drives with transparency and precision.</p>
            </div>

            <div className="grid-3" style={{ gap: 32 }}>
              {[
                { icon: Zap, title: 'AI Match Engine', desc: 'TF-IDF cosine similarity algorithms instantly rank candidates against Job Descriptions.', color: 'var(--accent)' },
                { icon: ShieldCheck, title: 'Governance Policy', desc: 'Strict enforcement of CGPA and backlog rules, with audit trails for manual overrides.', color: 'var(--accent3)' },
                { icon: BarChart3, title: 'Skill Gap Analytics', desc: 'Real-time visualizations comparing campus supply vs. market demand trends.', color: 'var(--warning)' },
                { icon: Users, title: 'Student Readiness', desc: 'Personalized circular charts showing students their exact profile completeness and skill gaps.', color: '#3b82f6' },
                { icon: Network, title: 'Explainable AI', desc: '"Why this score?" panels show exact percentage breakdowns (Skills, Academics, Projects).', color: '#8b5cf6' },
                { icon: ShieldCheck, title: 'Role-Based Routing', desc: 'Secure, dedicated portal experiences for Job Seekers and Placment Officers.', color: '#10b981' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="card hover-border" style={{ padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Icon size={24} />
                    </div>
                    <h3 style={{ fontSize: 20, marginBottom: 12 }}>{f.title}</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '80px 48px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {[
              { label: 'Increase in Offer Rates', value: '+35%', color: 'var(--accent)' },
              { label: 'Admin Time Saved', value: '60%', color: 'var(--text)' },
              { label: 'Match Accuracy', value: '94%', color: 'var(--accent)' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ padding: '40px 48px', background: '#fff', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
          © {new Date().getFullYear()} CampusConnect Intelligent Placement System. EdTech SaaS Platform.
        </footer>
      </main>
    </div>
  );
}
