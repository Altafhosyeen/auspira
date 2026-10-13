import { InfoCircleOutlined } from '@ant-design/icons';
import ModeCard from './completion/ModeCard';
import { Alert } from 'antd';
import React from 'react';

export default function AiAssistant() {
  const [mode, setMode] = React.useState('assist');

  const modes = [
    {
      value: 'quiet',
      title: 'Quiet Mode',
      desc: 'Background monitoring only. Alerts are minimal and restricted to critical deadline violations.',
      features: [
        { text: 'No proactive drafting', type: 'bad' },
        { text: 'No suggestion overlays', type: 'bad' },
        { text: 'Hard deadline alerts only', type: 'good' },
      ],
    },
    {
      value: 'assist',
      title: 'Assist Mode',
      desc: 'Balanced support. AI drafts routine communications and highlights moderate risks for review.',
      recommended: true,
      features: [
        { text: 'Drafts routine notices', type: 'good' },
        { text: 'Highlights clause deviations', type: 'good' },
        { text: 'Standard deadline alerts', type: 'good' },
      ],
    },
    {
      value: 'coach',
      title: 'Coach Mode',
      desc: 'Maximum guidance. AI explains NEC mechanisms contextually and offers strategic options.',
      features: [
        { text: 'Explains complex clauses', type: 'good' },
        { text: 'Suggests response strategies', type: 'good' },
        { text: 'Predictive risk analysis', type: 'good' },
      ],
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="heading-page text-center">AI Assistance Configuration</h1>
        <p className="mt-2 text-center text-gray-500">
          Select the level of AI intervention and guidance appropriate for this contract.
        </p>

        <Alert
          className="mt-6 rounded-xl"
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Important Note on Automation"
          description="Regardless of the selected mode, the AI system will never auto-issue notices or binding communications on your behalf. All actions require explicit human review and approval."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {modes?.map((m) => (
            <ModeCard
              key={m.value}
              {...m}
              features={[...m.features]}
              selected={mode === m.value}
              onChange={setMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
