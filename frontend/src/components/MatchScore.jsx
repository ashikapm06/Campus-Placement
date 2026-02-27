export default function MatchScore({ score, size = 60 }) {
  const getColor = (s) => {
    if (s >= 75) return '#34d399';
    if (s >= 50) return '#38bdf8';
    if (s >= 30) return '#fbbf24';
    return '#f87171';
  };

  const color = getColor(score);
  const r = (size / 2) - 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: size < 50 ? 11 : 14,
        color,
      }}>
        {score}%
      </div>
    </div>
  );
}
