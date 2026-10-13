export const APP_META = {
  NAME: 'Auspira',
  DESCRIPTION: 'Auspira',
} as const;

export const ASSET_KEYS = {
  MAIN_LOGO: 'main_logo',
  SECONDARY_LOGO: 'sec_logo',
  COVER_IMAGE: 'cover_image',
} as const;

export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production';

export const USER_DEFAULT_PROFILE_PIC = '/assets/images/default-user-image.jpg';
