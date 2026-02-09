/**
 * AchievementIcon - High-quality SVG icons for achievements
 * Replaces emojis with crisp, scalable vector graphics
 */

export const AchievementIcon = ({ icon, size = 40, color = '#fff' }) => {
  const iconProps = { width: size, height: size, color };

  switch (icon) {
    // Bankruptcy Achievements
    case 'FIRST_BANKRUPTCY':
      return <SkullIcon {...iconProps} />;
    case 'SERIAL_BANKRUPT':
      return <FireIcon {...iconProps} />;
    case 'LEGENDARY_DEBTOR':
      return <CrownIcon {...iconProps} />;
    
    // Debt Amount Achievements
    case 'THE_ONE_PERCENT':
      return <ChartUpIcon {...iconProps} />;
    case 'MAXIMUM_OVERDRIVE':
      return <LightningIcon {...iconProps} />;
    
    // Clean Record Achievements
    case 'CLEAN_START':
      return <SparklesIcon {...iconProps} />;
    case 'SAINT_STATUS':
      return <HaloIcon {...iconProps} />;
    
    // Bailout Achievements
    case 'GOOD_SAMARITAN':
      return <HeroIcon {...iconProps} />;
    case 'RESCUE_RANGER':
      return <HelicopterIcon {...iconProps} />;
    case 'DEBT_SAVIOR':
      return <BankIcon {...iconProps} />;
    
    // Received Bailouts
    case 'PROFESSIONAL_BEGGAR':
      return <PleadingIcon {...iconProps} />;
    
    // Check-in Achievements
    case 'DEDICATED':
      return <CalendarIcon {...iconProps} />;
    case 'CHECKIN_MACHINE':
      return <RobotIcon {...iconProps} />;
    
    // Streak Achievements
    case 'STREAK_MASTER':
      return <FlameStreakIcon {...iconProps} />;
    case 'STREAK_LEGEND':
      return <DiamondIcon {...iconProps} />;
    
    // Friendship Achievements
    case 'POPULAR':
      return <StarBurstIcon {...iconProps} />;
    case 'INFLUENCER':
      return <PhoneIcon {...iconProps} />;
    
    // Mercy Achievements
    case 'MERCY_MEEK':
      return <PrayIcon {...iconProps} />;
    case 'MERCY_GRANTER':
      return <HeartIcon {...iconProps} />;
    
    // Special Achievements
    case 'NIGHT_OWL':
      return <OwlIcon {...iconProps} />;
    case 'PERFECT_WEEK':
      return <BarChartIcon {...iconProps} />;
    case 'PHOENIX':
      return <PhoenixIcon {...iconProps} />;
    
    default:
      return <TrophyIcon {...iconProps} />;
  }
};

// Individual Icon Components
const SkullIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="10" r="1.5" fill={color} />
    <circle cx="15" cy="10" r="1.5" fill={color} />
    <path d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3a8 8 0 0 0-8-8z" />
    <path d="M8 16v2h8v-2" />
    <path d="M10 16v2M14 16v2" strokeWidth="1" />
    <path d="M11 13h2" strokeWidth="1" />
  </svg>
);

const FireIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-2.072-2.143-1.072 2.143-2.072 3.143-2.072 5.143a2.5 2.5 0 0 0 2.5 2.5z" fill={`${color}30`} />
    <path d="M12 14.5a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-2.072-2.143-1.072 2.143-2.072 3.143-2.072 5.143a2.5 2.5 0 0 0 2.5 2.5z" fill={`${color}50`} />
    <path d="M15.5 14.5a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-2.072-2.143-1.072 2.143-2.072 3.143-2.072 5.143a2.5 2.5 0 0 0 2.5 2.5z" fill={color} />
  </svg>
);

const CrownIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" fill={`${color}20`} />
    <circle cx="12" cy="6" r="2" fill={color} />
    <circle cx="5" cy="10" r="1.5" fill={color} />
    <circle cx="19" cy="10" r="1.5" fill={color} />
  </svg>
);

const ChartUpIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 17l3-6 3 3 4-6" fill="none" />
    <path d="M18 8v4M17 8h4" fill={color} />
  </svg>
);

const LightningIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={`${color}40`} />
    <path d="M13 2l-1 8h9l-10 12 1-8H3l10-12z" />
  </svg>
);

const SparklesIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill={color} />
    <path d="M18 12l1 2.5L21.5 15l-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" fill={`${color}60`} />
    <path d="M6 15l.75 2L9 17.75l-2.25.25-.75 2-.75-2-2.25-.25 2.25-.75.75-2z" fill={`${color}40`} />
  </svg>
);

const HaloIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="6" />
    <ellipse cx="12" cy="6" rx="8" ry="2" fill={`${color}30`} />
    <path d="M9 12a3 3 0 0 0 6 0" fill="none" />
    <circle cx="10" cy="11" r="0.5" fill={color} />
    <circle cx="14" cy="11" r="0.5" fill={color} />
  </svg>
);

const HeroIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill={`${color}20`} />
    <path d="M15 6l3-2M9 6L6 4" />
    <circle cx="18" cy="4" r="2" fill={color} />
    <circle cx="6" cy="4" r="2" fill={color} />
  </svg>
);

const HelicopterIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h16M12 10V4M4 14h16v6H4z" />
    <path d="M12 14v6" strokeDasharray="2 2" />
    <ellipse cx="12" cy="4" rx="8" ry="1.5" fill={`${color}30`} />
    <circle cx="8" cy="17" r="1.5" fill={color} />
    <circle cx="16" cy="17" r="1.5" fill={color} />
  </svg>
);

const BankIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M4 18h16M5 15h14l-7-12-7 12z" fill={`${color}20`} />
    <circle cx="12" cy="10" r="2" fill={color} />
    <path d="M12 6v-2M8 8l-1.5-1.5M16 8l1.5-1.5" />
  </svg>
);

const PleadingIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="1.5" fill={color} />
    <circle cx="15" cy="10" r="1.5" fill={color} />
    <path d="M8 14c1.5 2 4.5 2 6 0" fill="none" />
    <path d="M12 16v4M10 18l2 2 2-2" fill={color} />
  </svg>
);

const CalendarIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" fill={`${color}15`} />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <rect x="7" y="14" width="3" height="3" rx="0.5" fill={color} />
    <rect x="14" y="14" width="3" height="3" rx="0.5" fill={color} />
  </svg>
);

const RobotIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="16" height="12" rx="2" fill={`${color}20`} />
    <path d="M9 8V5a3 3 0 0 1 6 0v3" />
    <circle cx="9" cy="13" r="1.5" fill={color} />
    <circle cx="15" cy="13" r="1.5" fill={color} />
    <rect x="11" y="16" width="2" height="2" fill={color} />
    <path d="M12 5v-2M8 3h8" />
  </svg>
);

const FlameStreakIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c0 0-3 4-3 8 0 2 1 4 3 5 2-1 3-3 3-5 0-4-3-8-3-8z" fill={color} />
    <path d="M12 15c-2 0-3-1-3-3 0-1.5.5-2.5 1-3" strokeDasharray="2 2" />
    <path d="M8 22c0-2 2-4 4-4s4 2 4 4" fill={`${color}40`} />
  </svg>
);

const DiamondIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" fill={`${color}30`} />
    <path d="M12 22V9M2 9h20M6 3l6 6 6-6" />
    <path d="M9 3l3 6 3-6" fill={`${color}50`} />
  </svg>
);

const StarBurstIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`${color}30`} />
    <circle cx="12" cy="12" r="3" fill={color} />
  </svg>
);

const PhoneIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="3" fill={`${color}15`} />
    <path d="M12 18h.01" strokeWidth="2" />
    <circle cx="12" cy="6" r="1" fill={color} />
    <path d="M9 9h6M8 22l2-2 4 2 2-2" />
  </svg>
);

const PrayIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 22v-6M7 22v-6M12 16V8" />
    <path d="M7 16c0-3 2.5-5 5-5s5 2 5 5" fill={`${color}20`} />
    <circle cx="12" cy="5" r="2" fill={color} />
    <path d="M9 10l3 3 3-3" />
  </svg>
);

const HeartIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={`${color}40`} />
    <path d="M12 8l-1.5 3h3L12 14" strokeWidth="1" />
  </svg>
);

const OwlIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="14" rx="7" ry="6" fill={`${color}20`} />
    <circle cx="9" cy="12" r="2" fill={color} />
    <circle cx="15" cy="12" r="2" fill={color} />
    <path d="M12 8V4M8 6l-2-2M16 6l2-2" />
    <path d="M12 16v2M10 20h4" />
    <circle cx="9" cy="12" r="3" strokeDasharray="1 2" />
    <circle cx="15" cy="12" r="3" strokeDasharray="1 2" />
  </svg>
);

const BarChartIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" fill={`${color}10`} />
    <path d="M8 17v-5M12 17V9M16 17v-7" strokeWidth="2" />
    <rect x="6" y="14" width="4" height="3" rx="0.5" fill={color} />
    <rect x="10" y="10" width="4" height="7" rx="0.5" fill={color} />
    <rect x="14" y="12" width="4" height="5" rx="0.5" fill={color} />
  </svg>
);

const PhoenixIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-2 2-4 5-4 9 0 3 1.5 5.5 4 7 2.5-1.5 4-4 4-7 0-4-2-7-4-9z" fill={`${color}40`} />
    <path d="M12 2v16M8 6s-2 3-2 6c0 4 3 7 6 7s6-3 6-7c0-3-2-6-2-6" />
    <path d="M6 14l-2 2M18 14l2 2" />
    <path d="M10 20l2 2 2-2" />
  </svg>
);

const TrophyIcon = ({ width, height, color }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill={`${color}20`} />
  </svg>
);

export default AchievementIcon;
