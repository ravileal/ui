import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultList, ResultRow } from './ResultList';

describe('ResultList', () => {
  it('renders a labelled list with the rows as items', () => {
    render(
      <ResultList ariaLabel="Search results">
        <ResultRow primary="Frieren" />
        <ResultRow primary="Vinland Saga" />
      </ResultList>,
    );

    const list = screen.getByRole('list', { name: 'Search results' });
    expect(list.tagName).toBe('UL');
    expect(list.className).toContain('ui-result-list');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the empty label as a placeholder row when there are no children', () => {
    const { container } = render(<ResultList emptyLabel="Nothing found">{null}</ResultList>);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0].className).toBe('ui-result-list-empty');
    expect(rows[0].textContent).toBe('Nothing found');
    expect(container.querySelector('.ui-result-list')?.children).toHaveLength(1);
  });

  it('renders no placeholder when no children and no emptyLabel', () => {
    render(<ResultList>{null}</ResultList>);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});

describe('ResultRow', () => {
  it('renders media initials, primary, secondary lines, meta and the action', () => {
    const { container } = render(
      <ResultRow
        media={{ src: null, initials: 'FR' }}
        primary="Frieren"
        secondary={['Sousou no Frieren', '']}
        meta="2023"
        action={<button type="button">Add</button>}
      />,
    );

    const row = container.querySelector('.ui-result-row') as HTMLElement;
    expect(row.tagName).toBe('LI');
    expect(row.querySelector('.ui-result-row-media .ui-media-thumb-fallback')?.textContent).toBe(
      'FR',
    );

    const secondary = row.querySelectorAll('.ui-result-row-secondary');
    expect(secondary).toHaveLength(1);
    expect(secondary[0].textContent).toBe('Sousou no Frieren');

    const text = row.querySelector('.ui-result-row-text') as HTMLElement;
    expect(text.children[0].textContent).toBe('Frieren');
    expect(row.querySelector('.ui-result-row-meta')?.textContent).toBe('2023');
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
  });

  it('omits the media span when media is undefined', () => {
    const { container } = render(<ResultRow primary="Frieren" />);
    expect(container.querySelector('.ui-result-row-media')).toBeNull();
  });

  it('fires onClick on click and on Enter', async () => {
    const onClick = vi.fn();
    const { container } = render(<ResultRow primary="Frieren" onClick={onClick} />);
    const row = container.querySelector('.ui-result-row') as HTMLElement;

    expect(row.getAttribute('role')).toBe('button');
    expect(row.getAttribute('tabindex')).toBe('0');
    expect(row.className).toContain('is-clickable');

    await userEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);

    row.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not fire the row click when the action is clicked', async () => {
    const onRowClick = vi.fn();
    const onActionClick = vi.fn();
    const { container } = render(
      <ResultRow
        primary="Frieren"
        onClick={onRowClick}
        action={
          <button type="button" onClick={onActionClick}>
            Add
          </button>
        }
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(container.querySelector('.ui-result-row')?.getAttribute('role')).toBe('button');
  });
});
