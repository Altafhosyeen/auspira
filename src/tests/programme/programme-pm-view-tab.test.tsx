import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProgrammePmViewTab from '@/modules/programme/components/programme-pm-view-tab';
import type { SectionalCompletionRow } from '@/modules/programme/types/programme.types';

// jsdom implements neither of these, and antd's Card reads both as it mounts.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// The PM View table is laid out by hand rather than with an antd Table, so the two things the
// screen cannot express in a type — the header labels and which column the slack falls to — are
// pinned here instead.

const renderTab = (sectionalCompletions: SectionalCompletionRow[] = []) =>
  render(
    <ProgrammePmViewTab
      revisionLabel="PRG-004 — Rev 4"
      contractDates={[
        {
          label: 'Planned Completion',
          date: '05 Aug 2026',
          caption: "The Contractor's own forecast completion in this revision.",
        },
      ]}
      sectionalCompletions={sectionalCompletions}
    />
  );

const cardTitled = (container: HTMLElement, title: string): HTMLElement => {
  const card = [...container.querySelectorAll<HTMLElement>('.ant-card')].find((element) =>
    element.textContent?.includes(title)
  );
  if (!card) throw new Error(`No card titled ${title}`);
  return card;
};

const cellReading = (scope: HTMLElement, text: string): HTMLElement => {
  const cell = [...scope.querySelectorAll<HTMLElement>('.ant-typography, .ant-tag')].find(
    (element) => element.textContent === text
  );
  if (!cell) throw new Error(`No cell reading "${text}"`);
  return cell;
};

describe('ProgrammePmViewTab sectional completions table', () => {
  const row = (overrides: Partial<SectionalCompletionRow> = {}): SectionalCompletionRow => ({
    section: 'Marine Piling Works Complete',
    reference: 'C-167-DWR-1320',
    completionDate: '25 Mar 2026',
    dated: true,
    status: { label: 'Completed', tone: 'positive' },
    ...overrides,
  });

  it('renders the sectional completions card with the expected columns', () => {
    const { container } = renderTab([row()]);
    const card = cardTitled(container, 'Sectional Completions');

    expect(cellReading(card, 'Section')).toBeTruthy();
    expect(cellReading(card, 'Marine Piling Works Complete')).toBeTruthy();
    expect(cellReading(card, 'Completion date').style.textAlign).toBe('');
    expect(cellReading(card, '25 Mar 2026').style.textAlign).toBe('');
    expect(cellReading(card, 'Status').style.textAlign).toBe('');
    expect(cellReading(card, 'Completed')).toBeTruthy();
  });

  it('reports a section the backend has not completed as pending', () => {
    const { container } = renderTab([
      row({ completionDate: '', dated: false, status: { label: 'Pending', tone: 'warning' } }),
    ]);
    const card = cardTitled(container, 'Sectional Completions');

    expect(cellReading(card, 'Pending')).toBeTruthy();
    expect(cellReading(card, '—')).toBeTruthy();
  });

  it('falls back to the table\u2019s empty value where the extract sends no status', () => {
    const { container } = renderTab([row({ status: undefined })]);
    const card = cardTitled(container, 'Sectional Completions');

    const tags = [...card.querySelectorAll('.ant-tag')].map((tag) => tag.textContent);
    expect(tags).not.toContain('Completed');
    expect(cellReading(card, '—')).toBeTruthy();
  });

  it('does not render the redundant key dates section', () => {
    const { container } = renderTab([row()]);
    const keyDatesCard = [...container.querySelectorAll<HTMLElement>('.ant-card')].find((element) =>
      element.textContent?.includes('Key Dates')
    );
    expect(keyDatesCard).toBeUndefined();
  });
});
