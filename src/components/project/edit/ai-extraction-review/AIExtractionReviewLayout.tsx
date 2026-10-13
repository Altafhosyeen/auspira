import { KeyDatesCard } from './KeyDatesCard';
import { NECOptionsCard } from './NECOptionsCard';
import { PartiesCard } from './PartiesCard';

export default function AIExtractionReviewLayout() {
  const parties = {
    score: 95,
    employer: 'Acme Corporation Ltd',
    contractor: 'BuildRight Construction Services',
    pm: 'Sarah Jenkins, PM Group',
  };

  const dates = {
    score: 95,
    dates: [
      { label: 'Starting Date', value: '15 October 2023' },
      { label: 'Access Date', value: '01 November 2023' },
      { label: 'Completion Date', value: '30 June 2025' },
    ],
  };

  const nec = {
    score: 98,
    main: 'Option C: Target contract with activity schedule',
    secondary: ['W2', 'X2', 'X7', 'X16', 'X18', 'Y(UK)2'],
  };

  return (
    <div className="bg-gray-100 p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <PartiesCard data={parties} />
        <KeyDatesCard data={dates} />
        <NECOptionsCard data={nec} />
      </div>
    </div>
  );
}
