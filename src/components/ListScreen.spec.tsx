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
