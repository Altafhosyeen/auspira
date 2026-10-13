'use client';

import { useCallback, useState } from 'react';
import type { ConfirmActionCopy } from '../constants/compensation-event-confirm.constants';

interface PendingAction {
  action: ConfirmActionCopy;
  subject: string;
  run: () => void | Promise<void>;
}

// Holds whichever action is awaiting confirmation, so a page can gate several different
// mutations behind one modal instead of a boolean per action. `ask` stores the work; the
// modal's confirm runs it and closes on completion.
export const useConfirmAction = () => {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirming, setConfirming] = useState(false);

  const ask = useCallback(
    (action: ConfirmActionCopy, subject: string, run: () => void | Promise<void>) =>
      setPending({ action, subject, run }),
    []
  );

  // The caller's own try/catch decides what a failure means, so this only has to make sure
  // the dialog stops spinning and closes either way.
  const confirm = useCallback(async () => {
    if (!pending) return;
    setConfirming(true);
    try {
      await pending.run();
    } finally {
      setConfirming(false);
      setPending(null);
    }
  }, [pending]);

  // Ignored mid-flight: closing while the mutation is running would strand the spinner.
  const cancel = useCallback(() => {
    if (!confirming) setPending(null);
  }, [confirming]);

  return { pending, confirming, ask, confirm, cancel };
};
