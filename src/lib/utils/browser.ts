export const scrollToElement = (key: string) => {
  const element = document.getElementById(key);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export function getImageMimeType(uint8Array: Uint8Array): string | null {
  const header = uint8Array.slice(0, 4).toString();
  if (header.startsWith('\x89PNG')) return 'image/png';
  if (header.startsWith('\xFF\xD8\xFF')) return 'image/jpeg';
  return null;
}

export function getFlagUrl(countryCode: string): string {
  if (!countryCode || typeof countryCode !== 'string') return '';

  const code = countryCode.trim().toLowerCase();
  return `https://flagcdn.com/${code}.svg`;
}

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
};

export const base64ToBlob = (base64Data: string, contentType = 'application/pdf'): Blob => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};
