import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssueList from './IssueList';

describe('IssueList', () => {
  it('renders the title, path badge and message for each issue', () => {
    render(
      <IssueList
        title="Validation issues"
        issues={[
          { path: 'total', message: 'Total diverges from the sum of items' },
          { path: 'date', message: 'Invalid due date' },
        ]}
      />,
    );

    expect(screen.getByText('Validation issues')).toBeInTheDocument();
    expect(screen.getByText('total')).toHaveClass('ui-badge', 'ui-badge--soft', 'ui-badge--danger');
    expect(screen.getByText('Total diverges from the sum of items')).toBeInTheDocument();
    expect(screen.getByText('Invalid due date')).toBeInTheDocument();
    expect(screen.queryByText('No issues')).not.toBeInTheDocument();
  });

  it('honours a custom tone on the path badge', () => {
    render(<IssueList issues={[{ path: 'note', message: 'Card was inferred', tone: 'info' }]} />);
    expect(screen.getByText('note')).toHaveClass('ui-badge--info');
  });

  it('renders the default and custom empty text when there are no issues', () => {
    const { unmount } = render(<IssueList issues={[]} />);
    expect(screen.getByText('No issues')).toBeInTheDocument();
    unmount();

    render(<IssueList issues={[]} emptyText="Everything parsed" />);
    expect(screen.getByText('Everything parsed')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('exposes clickable issues as buttons and calls onSelect', async () => {
    const onSelect = vi.fn();
    render(<IssueList issues={[{ path: 'total', message: 'Total diverges', onSelect }]} />);

    const row = screen.getByRole('button', { name: /Total diverges/ });
    await userEvent.click(row);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows the default action label and the custom one', async () => {
    const { unmount } = render(
      <IssueList issues={[{ path: 'total', message: 'Total diverges', onSelect: vi.fn() }]} />,
    );
    expect(screen.getByText(/Corrigir →/)).toBeInTheDocument();
    unmount();

    render(
      <IssueList
        issues={[
          {
            path: 'total',
            message: 'Total diverges',
            onSelect: vi.fn(),
            actionLabel: 'Abrir linha',
          },
        ]}
      />,
    );
    expect(screen.getByText(/Abrir linha →/)).toBeInTheDocument();
  });

  it('renders issues without onSelect as plain rows', () => {
    render(<IssueList issues={[{ path: 'total', message: 'Total diverges' }]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/Corrigir/)).not.toBeInTheDocument();
    expect(screen.getByText('Total diverges')).toBeInTheDocument();
  });

  it('forwards className and style to the wrapper', () => {
    const { container } = render(
      <IssueList issues={[]} className="issues-panel" style={{ marginTop: 8 }} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('issues-panel');
    expect(wrapper).toHaveStyle({ marginTop: '8px' });
  });
});
