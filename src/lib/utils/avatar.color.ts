export interface AvatarTheme {
  bg: string;
  text: string;
  border: string;
}

export const AVATAR_PALETTE: AvatarTheme[] = [
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
];

/**
 * Generates a stable and consistent color theme based on a string hash
 * @param name The full name of the user
 */
export const getAvatarTheme = (name: string): AvatarTheme => {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

/**
 * Extracts a 1 or 2 letter uppercase initial from a string
 * (e.g., "Mustafa Kamal" -> "MK", "Altaf" -> "AL")
 * @param name The full name of the user
 */
export const getInitials = (name: string): string => {
  if (!name) return 'N/A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
