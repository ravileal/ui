import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeViewer from './CodeViewer';

function numberedRows() {
  return screen
    .getAllByRole('listitem')
    .map((row) => (row.firstElementChild as HTMLElement).textContent);
}

describe('CodeViewer', () => {
  it('renders a labelled list with one item per line', () => {
    render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[{ text: 'invoice 1' }, { text: 'total 10,00' }, { text: 'end' }]}
      />,
    );

    expect(screen.getByRole('list', { name: 'Parsed lines' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('total 10,00')).toBeInTheDocument();
  });

  it('numbers lines by position unless an explicit number is given', () => {
    render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[{ text: 'header' }, { text: 'body' }, { text: 'page skip', number: 12 }]}
      />,
    );

    expect(numberedRows()).toEqual(['1', '2', '12']);
  });

  it('renders the default and custom empty text when there are no lines', () => {
    const { unmount } = render(<CodeViewer ariaLabel="Parsed lines" lines={[]} />);
    expect(screen.getByText('No lines')).toBeInTheDocument();
    unmount();

    render(<CodeViewer ariaLabel="Parsed lines" lines={[]} emptyText="Nothing parsed yet" />);
    expect(screen.getByText('Nothing parsed yet')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('clamps the scroll area to maxHeight', () => {
    const { unmount } = render(<CodeViewer ariaLabel="Parsed lines" lines={[{ text: 'line' }]} />);
    expect(screen.getByRole('list').style.maxHeight).toBe('320px');
    unmount();

    render(<CodeViewer ariaLabel="Parsed lines" lines={[{ text: 'line' }]} maxHeight={120} />);
    expect(screen.getByRole('list').style.maxHeight).toBe('120px');
  });

  it('renders per-line badges with the line tone', () => {
    const { container } = render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[{ text: 'total 10,00', badge: 'dup', tone: 'warning' }]}
      />,
    );

    expect(screen.getByText('dup')).toHaveClass('ui-badge', 'ui-badge--solid', 'ui-badge--warning');
    expect(container.querySelectorAll('.ui-badge')).toHaveLength(1);
  });

  it('exposes the line detail as the row title', () => {
    render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[{ text: 'total', detail: 'Missing amount on this line' }]}
      />,
    );

    expect(screen.getByRole('listitem')).toHaveAttribute('title', 'Missing amount on this line');
  });

  it('dims muted lines and strikes through removed ones', () => {
    render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[
          { text: 'ignored', muted: true },
          { text: 'removed', strikethrough: true },
        ]}
      />,
    );

    const [muted, struck] = screen.getAllByRole('listitem');
    expect(muted.style.opacity).toBe('0.65');
    expect(muted.style.color).toBe('var(--ui-text-3)');
    expect(struck.style.textDecoration).toBe('line-through');
  });

  it('applies the className and border radius override on the shell', () => {
    const { container } = render(
      <CodeViewer
        ariaLabel="Parsed lines"
        lines={[{ text: 'line' }]}
        className="inspector"
        style={{ borderRadius: 4 }}
      />,
    );

    const shell = container.firstElementChild as HTMLElement;
    expect(shell).toHaveClass('inspector');
    expect(shell).toHaveStyle({ borderRadius: '4px' });
  });
});
