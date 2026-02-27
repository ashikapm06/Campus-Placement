import React from 'react';

const MatchScoreRing = ({ score, size = 64, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = 'var(--accent3)'; // green
    if (score < 50) color = 'var(--danger)'; // red
    else if (score < 75) color = 'var(--warning)'; // yellow

    return (
        <div className="score-ring-container" style={{ width: size, height: size, position: 'relative' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--border)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Score ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    strokeLinecap="round"
                />
            </svg>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: size > 80 ? '24px' : '16px',
                    color: 'var(--text)'
                }}
            >
                {score}%
            </div>
        </div>
    );
};

export default MatchScoreRing;
