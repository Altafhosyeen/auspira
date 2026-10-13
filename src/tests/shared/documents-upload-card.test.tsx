import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import DocumentsUploadCard from '@/components/shared/documents-upload-card';

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

// The card owns the list; antd's Upload is only the picker. These tests pin that split,
// because antd reports the whole of its own accumulated list on every `onChange` — a file
// deleted here would otherwise ride the next pick's payload back onto the form.
const pdf = (name: string) => new File(['%PDF-1.4'], name, { type: 'application/pdf' });

const Harness = () => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <DocumentsUploadCard files={files} onFilesChange={setFiles} />
      <span data-testid="names">{files.map((file) => file.name).join(',')}</span>
    </>
  );
};

const fileInput = (container: HTMLElement) => {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('No file input rendered');
  return input as HTMLInputElement;
};

const pick = async (container: HTMLElement, ...files: File[]) => {
  fireEvent.change(fileInput(container), { target: { files } });
  await waitFor(() => expect(screen.getByTestId('names').textContent).not.toBe(''));
};

const deleteFirstRow = (container: HTMLElement) => {
  const button = container.querySelector('.anticon-delete')?.closest('button');
  if (!button) throw new Error('No delete button rendered');
  fireEvent.click(button);
};

describe('DocumentsUploadCard', () => {
  it('adds a picked file', async () => {
    const { container } = render(<Harness />);

    await pick(container, pdf('a.pdf'));

    expect(screen.getByTestId('names').textContent).toBe('a.pdf');
  });

  it('drops a deleted file from the list', async () => {
    const { container } = render(<Harness />);

    await pick(container, pdf('a.pdf'));
    deleteFirstRow(container);

    await waitFor(() => expect(screen.getByTestId('names').textContent).toBe(''));
  });

  // The bug this guards: antd's Upload keeps its own fileList, so a file removed from the
  // card came back attached on the next pick.
  it('does not resurrect a deleted file on the next pick', async () => {
    const { container } = render(<Harness />);

    await pick(container, pdf('a.pdf'));
    deleteFirstRow(container);
    await waitFor(() => expect(screen.getByTestId('names').textContent).toBe(''));

    fireEvent.change(fileInput(container), { target: { files: [pdf('b.pdf')] } });

    await waitFor(() => expect(screen.getByTestId('names').textContent).toBe('b.pdf'));
  });

  it('lets the same file be added again after it is deleted', async () => {
    const { container } = render(<Harness />);

    await pick(container, pdf('a.pdf'));
    deleteFirstRow(container);
    await waitFor(() => expect(screen.getByTestId('names').textContent).toBe(''));

    fireEvent.change(fileInput(container), { target: { files: [pdf('a.pdf')] } });

    await waitFor(() => expect(screen.getByTestId('names').textContent).toBe('a.pdf'));
  });
});
