import { Card, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { type EntityLifecycleEntry, EwLifecycleStatus } from '@/constants/enum.constant';

export interface DetailLifecycleStep {
  key: string;
  label: string;
  date: string;
  complete: boolean;
  /** The stage the record sits at now — drawn as a ring in `tone.current`. */
  current?: boolean;
}

export interface DetailLifecycleTone {
  navy: string;
  muted: string;
  value: string;
  complete: string;
  pending: string;
  /** The stage the record sits at now — drawn as a hollow ring when set. */
  current?: string;
}

interface DetailLifecycleRailProps {
  title: string;
  steps: DetailLifecycleStep[];
  tone: DetailLifecycleTone;
  /** Muted note shown beside the title — e.g. a discarded/withdrawn record. */
  note?: string;
  /** Render the title through the card head, so its rule spans the full card width. */
  divider?: boolean;
  /** Optional content rendered under the rail, e.g. a response deadline. */
  footer?: ReactNode;
}

/** A stage as the record's `lifecycle[]` reports it. */
export interface LifecycleStageState {
  stage: number;
  complete: boolean;
  active: boolean;
  occurredAt: string | null;
}

/** The enum names each backend stage value maps to — used for the step labels. */
export type LifecycleStageLabels = Record<number, string>;

/**
 * Maps a record's `lifecycle[]` entries onto per-stage state. A stage is complete when
 * its status is Completed (2); the furthest non-complete stage that has been reached
 * (status Pending) reads as active; everything else is upcoming.
 */
export const toLifecycleStageStates = (
  lifecycle: EntityLifecycleEntry[] | null | undefined,
  stages: number[]
): LifecycleStageState[] => {
  const byStage = new Map((lifecycle ?? []).map((entry) => [Number(entry.stage), entry]));

  return stages.map((stage) => {
    const entry = byStage.get(stage);
    const status = Number(entry?.status ?? EwLifecycleStatus.NotStarted);
    const complete = status === EwLifecycleStatus.Completed;
    const active = !complete && status !== EwLifecycleStatus.NotStarted;

    return { stage, complete, active, occurredAt: entry?.occurredAt ?? null };
  });
};

/**
 * Stage states → rail steps. Completed stages show their date; the active stage shows
 * "In progress"; upcoming stages show a dash. Pass the stage enum names so labels read
 * as the design spells them.
 */
export const buildLifecycleStepsFromStages = (
  states: LifecycleStageState[],
  labels: LifecycleStageLabels,
  formatDate: (value?: string | null) => string
): DetailLifecycleStep[] =>
  states.map(({ stage, complete, active, occurredAt }) => {
    if (complete) {
      return {
        key: String(stage),
        label: labels[stage] ?? String(stage),
        date: formatDate(occurredAt) || 'Completed',
        complete: true,
      };
    }
    if (active) {
      return {
        key: String(stage),
        label: labels[stage] ?? String(stage),
        date: 'In progress',
        complete: false,
        current: true,
      };
    }
    return {
      key: String(stage),
      label: labels[stage] ?? String(stage),
      date: '—',
      complete: false,
    };
  });

// Presentational — the vertical Lifecycle rail beside a detail screen's Event Summary card.
// One node per stage the record carries: filled for completed, a hollow ring for the
// stage in progress, hollow grey for upcoming. Shared by the Early Warning, Project
// Manager's Instruction and Compensation Event detail screens so all rails read alike.
export const DetailLifecycleRail = ({
  title,
  steps,
  tone,
  note,
  divider = false,
  footer,
}: DetailLifecycleRailProps) => {
  const head = (
    <Flex align="center" justify="space-between" gap={12}>
      <Typography.Text strong style={{ color: tone.navy, fontSize: 16 }}>
        {title}
      </Typography.Text>
      {note && (
        <Typography.Text style={{ color: tone.muted, fontSize: 12 }}>{note}</Typography.Text>
      )}
    </Flex>
  );

  const rail = (
    <Flex vertical>
      {steps.map((step, index) => {
        const dotColor = step.complete ? tone.complete : tone.pending;
        const isCurrent = !step.complete && step.current === true && !!tone.current;

        return (
          <Flex gap={12} key={step.key}>
            <Flex vertical align="center" style={{ flex: 'none' }}>
              <div
                style={{
                  background: isCurrent ? tone.navy : dotColor,
                  border: isCurrent ? `2px solid ${tone.current}` : `2px solid ${dotColor}`,
                  borderRadius: '50%',
                  height: 12,
                  marginTop: 4,
                  width: 12,
                }}
              />
              {index < steps.length - 1 && (
                <div style={{ background: tone.pending, flex: '1 1 auto', width: 1 }} />
              )}
            </Flex>

            <Flex vertical gap={2} style={{ paddingBottom: index < steps.length - 1 ? 18 : 0 }}>
              <Typography.Text
                style={{
                  color: step.complete ? tone.value : tone.muted,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {step.label}
              </Typography.Text>
              <Typography.Text
                style={{
                  color: isCurrent ? (tone.current ?? tone.muted) : tone.muted,
                  fontSize: 12,
                }}
              >
                {step.date}
              </Typography.Text>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );

  if (divider) {
    return (
      <Card title={head} style={{ height: '100%' }} styles={{ body: { padding: '22px 24px' } }}>
        {rail}
        {footer}
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%' }} styles={{ body: { padding: '22px 24px' } }}>
      <Flex vertical gap={18}>
        {head}
        {rail}
        {footer}
      </Flex>
    </Card>
  );
};
