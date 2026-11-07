import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteBlock from './NoteBlock';

describe('NoteBlock', () => {
  it('renders the caption, the note and one line per detail', () => {
    const { container } = render(
      <NoteBlock title="Last run" lines={['ok', 'probe 12ms']}>
        The delivery is retried once before the event is marked as failed.
      </NoteBlock>,
    );

    expect(container.querySelector('.ui-note-block-title')?.textContent).toBe('Last run');
    expect(container.querySelector('.ui-note-block-note')?.textContent).toContain(
      'The delivery is retried once',
    );
    expect(container.querySelectorAll('.ui-note-block-line')).toHaveLength(2);
    expect(container.querySelector('.ui-note-block')?.className).not.toContain(
      'ui-note-block--neutral',
    );
  });

  it('renders labelled lines in monospace by default', () => {
    const { container } = render(
      <NoteBlock
        lines={[
          { label: 'Webhook target', value: 'https://hooks.example.com/averylongunbrokenpath' },
          { label: 'Last error', value: 'ECONNRESET', tone: 'danger' },
        ]}
      >
        Delivery details.
      </NoteBlock>,
    );

    const lines = container.querySelectorAll('.ui-note-block-line');
    expect(lines[0].querySelector('.ui-note-block-line-label')?.textContent).toBe('Webhook target');
    const first = lines[0].querySelector('.ui-note-block-line-value');
    expect(first?.className).toContain('ui-note-block-line-value--mono');
    expect(first?.textContent).toBe('https://hooks.example.com/averylongunbrokenpath');

    const second = lines[1].querySelector('.ui-note-block-line-value');
    expect(second?.className).toContain('ui-note-block-line-value--danger');
  });

  it('lets a line opt out of mono and carry a title', () => {
    const { container } = render(
      <NoteBlock
        lines={[{ label: 'Attempts', value: '3', mono: false, title: 'Since midnight' }]}
      />,
    );

    const value = container.querySelector('.ui-note-block-line-value');
    expect(value?.className).not.toContain('ui-note-block-line-value--mono');
    expect(value?.getAttribute('title')).toBe('Since midnight');
  });

  it('applies the tone and mono modifiers to the block and the note', () => {
    const { container, rerender } = render(<NoteBlock tone="warning">Heads up.</NoteBlock>);
    expect(container.querySelector('.ui-note-block')?.className).toContain(
      'ui-note-block--warning',
    );
    expect(container.querySelector('.ui-note-block-note')?.className).not.toContain(
      'ui-note-block-note--mono',
    );

    rerender(
      <NoteBlock tone="danger" mono className="sheet-note">
        fatal: probe exited 1
      </NoteBlock>,
    );
    const block = container.querySelector('.ui-note-block');
    expect(block?.className).toContain('ui-note-block--danger');
    expect(block?.className).toContain('sheet-note');
    expect(container.querySelector('.ui-note-block-note')?.className).toContain(
      'ui-note-block-note--mono',
    );
  });

  it('renders an empty block when it has neither a note nor lines', () => {
    const { container } = render(<NoteBlock />);
    expect(container.querySelector('.ui-note-block-note')).toBeNull();
    expect(container.querySelector('.ui-note-block-lines')).toBeNull();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
