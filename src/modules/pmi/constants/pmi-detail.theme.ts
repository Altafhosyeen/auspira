import { APP_COLORS } from '@/constants/app.theme';

// Detail-screen palette — extends the shared app tokens with the tints the PMI
// detail cards/rails use (same family as the Early Warning detail screen).
export const PMI_DETAIL_COLORS = {
  ...APP_COLORS,
  mainBorder: 'rgba(15, 76, 129, 0.5)',
  tabBarBg: APP_COLORS.mainSoft,
  activeTabGradient: 'linear-gradient(90deg, #6B21A8 0%, #EF4444 100%)',
  approvedValue: '#0CBE73',
  chipViolet: '#F3E8FF',
  chipMint: '#E3FCEF',
  chipAmber: '#FFEACF',
  chipBlue: APP_COLORS.mainSoft,
  chipIcon: APP_COLORS.main,
} as const;

export const PMI_DETAIL_SIZES = {
  tabBarHeight: 46,
  tabIndicatorHeight: 3,
} as const;

// The shared DetailLifecycleRail tone — complete steps in navy, pending in grey.
export const PMI_LIFECYCLE_TONE = {
  navy: PMI_DETAIL_COLORS.main,
  muted: PMI_DETAIL_COLORS.textMuted,
  value: PMI_DETAIL_COLORS.text,
  complete: PMI_DETAIL_COLORS.main,
  pending: '#D9D9D9',
} as const;
