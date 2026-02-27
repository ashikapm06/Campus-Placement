
import React from 'react';
import { Info, X } from 'lucide-react';

const ExplainabilityPanel = ({ scoreData, onClose }) => {
    if (!scoreData) return null;

    return (
        <div className="explainability-overlay" style={overlayStyle}>
            <div className="card fade-in" style={panelStyle}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={20} color="var(--accent)" />
                        <h3 style={{ margin: 0 }}>AI Scoring Breakdown</h3>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                        This match percentage is calculated using our transparent Weighted Scoring Algorithm. Here's exactly how the AI evaluated this match:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(scoreData.breakdown || {}).map(([key, item]) => (
                            <div key={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.score} / {item.max}</span>
                                </div>
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${(item.score / item.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Match Score</span>
                        <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                            {scoreData.matchPercentage}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
};

const panelStyle = {
    width: '100%',
    maxWidth: '480px',
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
};

const headerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f9fafb'
};

const closeBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
};

export default ExplainabilityPanel;
