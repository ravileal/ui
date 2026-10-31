import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListCard, ListEmptyState, ListRow, ListScreen, ListSearch } from './ListScreen';

describe('ListScreen', () => {
  it('renders the page header and primary action', async () => {
    const onClick = vi.fn();
    render(
      <ListScreen
        title="Aliases"
        subtitle="Description aliases"
        action={{ label: 'New alias', onClick }}
        testId="aliases-page"
      >
        <ListCard>content</ListCard>
      </ListScreen>,
    );

    expect(screen.getByRole('heading', { name: 'Aliases' })).toBeInTheDocument();
    expect(screen.getByText('Description aliases')).toBeInTheDocument();
    expect(screen.getByTestId('aliases-page')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'New alias' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom header actions instead of the single action', () => {
    render(
      <ListScreen
        title="Events"
        subtitle="Calendar"
        actions={<button type="button">Filters</button>}
      >
        <div>content</div>
      </ListScreen>,
    );
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' }).parentElement).toHaveClass(
      'ui-list-screen-actions',
    );
  });

  it('exposes responsive layout class hooks instead of inline layout styles', () => {
    const { container } = render(
      <ListScreen
        title="Events"
        subtitle="Calendar"
        action={{ label: 'New event', onClick: vi.fn() }}
        className="extra"
      >
        <div>content</div>
      </ListScreen>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveClass('ui-list-screen');
    expect(outer).toHaveClass('ui-scroll-y');
    expect(outer).toHaveClass('extra');

    const inner = container.querySelector('.ui-list-screen-inner') as HTMLElement;
    expect(inner).toHaveStyle({ maxWidth: '700px' });

    expect(container.querySelector('.ui-list-screen-head')).toBeInTheDocument();
    expect(container.querySelector('.ui-list-screen-title')).toHaveTextContent('Events');
    expect(container.querySelector('.ui-list-screen-subtitle')).toHaveTextContent('Calendar');
    expect(screen.getByRole('button', { name: 'New event' })).toHaveClass('ui-list-screen-action');
  });

  it('renders list rows, search and empty state', () => {
    const onChange = vi.fn();
    render(
      <ListCard>
        <ListRow>row content</ListRow>
        <ListEmptyState>nothing here</ListEmptyState>
        <ListSearch ariaLabel="Search aliases" placeholder="Search" value="" onChange={onChange} />
      </ListCard>,
    );

    expect(screen.getByText('row content')).toBeInTheDocument();
    expect(screen.getByText('nothing here')).toBeInTheDocument();
    expect(screen.getByLabelText('Search aliases')).toHaveAttribute('placeholder', 'Search');
  });
});
