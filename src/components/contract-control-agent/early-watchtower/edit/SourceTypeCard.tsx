import React from 'react';
import { Card, CardEyebrow } from './Card';

const SourceTypeCard = () => (
  <Card className="space-y-2 p-5">
    <CardEyebrow>Source type</CardEyebrow>
    <p className="ds-caption text-text font-bold">Contractor-raised EW via email.</p>
    <p className="ds-caption text-icon leading-relaxed">
      The contractor has notified the PM of a risk. Under NEC4, this creates an obligation to
      consider and respond. Auspira has read this email through the connected mailbox and flagged it
      for your review.
    </p>
  </Card>
);

export default SourceTypeCard;
