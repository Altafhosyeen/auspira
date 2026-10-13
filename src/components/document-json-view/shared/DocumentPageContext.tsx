'use client';

import { createContext, use } from 'react';
import type { DocumentPageContextValue } from './types';

const DocumentPageContext = createContext<DocumentPageContextValue | null>(null);

export const DocumentPageProvider = DocumentPageContext.Provider;

/**
 * Lets any ref tag deep inside a document-type metadata panel jump the
 * document viewer to the page it cites. Returns a no-op when rendered
 * outside DocumentReviewLayout (e.g. in isolation/tests) so callers don't
 * need to guard against a missing provider.
 */
export function useDocumentPage(): DocumentPageContextValue {
  const ctx = use(DocumentPageContext);
  return ctx ?? { goToPage: () => undefined };
}
