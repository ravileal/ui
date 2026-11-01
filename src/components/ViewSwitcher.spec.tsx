import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSwitcher } from './ViewSwitcher';

const STORAGE_KEY = 'ui-item-layout';

/** This Node runtime leaves `window.localStorage` undefined, so the spec owns one. */
function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.has(key) ? (values.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, String(value));
    },
  };
}

describe('ViewSwitcher', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: createMemoryStorage(),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders one option per layout and marks the current one', () => {
    render(<ViewSwitcher value="list" onChange={() => {}} />);

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(3);
    expect(options.map((option) => option.getAttribute('aria-label'))).toEqual([
      'Grid',
      'List',
      'Adaptive',
    ]);
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radiogroup', { name: 'Item layout' })).toBeInTheDocument();
  });

  it('renders only the requested layouts with custom labels', () => {
    render(
      <ViewSwitcher
        value="grid"
        onChange={() => {}}
        layouts={['grid', 'list']}
        labels={{ grid: 'Cards', list: 'Rows' }}
        ariaLabel="Show as"
      />,
    );

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.getAttribute('aria-label'))).toEqual(['Cards', 'Rows']);
    expect(screen.getByRole('radiogroup', { name: 'Show as' })).toBeInTheDocument();
  });

  it('is icon-only by default, with no visible words', () => {
    const { container } = render(
      <ViewSwitcher
        value="grid"
        onChange={() => {}}
        layouts={['grid', 'list']}
        labels={{ grid: 'Grade', list: 'Lista' }}
      />,
    );

    const options = screen.getAllByRole('radio');
    // The reference toolbar is two pictures: no "Grade"/"Lista" on screen.
    expect(options.map((option) => option.textContent)).toEqual(['', '']);
    expect(options.map((option) => option.getAttribute('aria-label'))).toEqual(['Grade', 'Lista']);
    for (const option of options) {
      expect(option).toHaveClass('ui-segmented-item--icon');
      expect(option.querySelector('.ui-view-switcher-icon > svg')).not.toBeNull();
      expect(option.querySelector('.ui-view-switcher-icon')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
    }
    expect(container.querySelectorAll('.ui-view-switcher-icon svg')).toHaveLength(2);
  });

  it('matches the default Button height in the segmented bar', () => {
    const { container } = render(<ViewSwitcher value="grid" onChange={() => {}} />);

    expect(container.querySelector('.ui-segmented--md')).not.toBeNull();
    expect(container.querySelector('select')).toBeNull();
  });

  it('takes the segmented size, so it can follow the Button beside it', () => {
    const { container, rerender } = render(
      <ViewSwitcher value="grid" onChange={() => {}} size="lg" />,
    );
    expect(container.querySelector('.ui-segmented--lg')).not.toBeNull();

    rerender(<ViewSwitcher value="grid" onChange={() => {}} size="sm" />);
    expect(container.querySelector('.ui-segmented--sm')).not.toBeNull();
  });

  it('shows the words again with showLabels', () => {
    render(
      <ViewSwitcher
        value="grid"
        onChange={() => {}}
        layouts={['grid', 'list']}
        labels={{ grid: 'Grade', list: 'Lista' }}
        showLabels
      />,
    );

    const options = screen.getAllByRole('radio');
    expect(options.map((option) => option.textContent)).toEqual(['Grade', 'Lista']);
    expect(options.every((option) => !option.classList.contains('ui-segmented-item--icon'))).toBe(
      true,
    );
  });

  it('renders an explicit icon override with the accessible name', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ViewSwitcher
        value="grid"
        onChange={onChange}
        layouts={['grid', 'list']}
        icons={{ grid: <svg data-testid="custom-grid" /> }}
      />,
    );

    const grid = screen.getByRole('radio', { name: 'Grid' });
    const list = screen.getByRole('radio', { name: 'List' });
    expect(grid).toHaveAttribute('aria-label', 'Grid');
    expect(grid).toHaveAttribute('title', 'Grid');
    expect(grid.textContent).toBe('');
    expect(screen.getByTestId('custom-grid')).toBeInTheDocument();
    // The layout without an override keeps the glyph the switcher ships.
    expect(list.querySelector('.ui-view-switcher-icon svg')).not.toBeNull();

    await user.click(list);
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('calls onChange with the clicked layout', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewSwitcher value="grid" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Adaptive' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('adaptive');
  });

  it('restores a stored preference once on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, 'list');
    const onChange = vi.fn();

    render(<ViewSwitcher value="grid" onChange={onChange} storageKey={STORAGE_KEY} />);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('does not fire when the stored value is unknown', () => {
    window.localStorage.setItem(STORAGE_KEY, 'kanban');
    const onChange = vi.fn();

    render(<ViewSwitcher value="grid" onChange={onChange} storageKey={STORAGE_KEY} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not fire when the stored value is already the current one', () => {
    window.localStorage.setItem(STORAGE_KEY, 'grid');
    const onChange = vi.fn();

    render(<ViewSwitcher value="grid" onChange={onChange} storageKey={STORAGE_KEY} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('writes the new layout on every change', async () => {
    const user = userEvent.setup();
    render(<ViewSwitcher value="grid" onChange={() => {}} storageKey={STORAGE_KEY} />);

    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('list');

    await user.click(screen.getByRole('radio', { name: 'Adaptive' }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('adaptive');
  });

  it('never reads or writes storage without a storageKey', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const user = userEvent.setup();

    render(<ViewSwitcher value="grid" onChange={() => {}} />);
    await user.click(screen.getByRole('radio', { name: 'List' }));

    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('ViewSwitcher layout subset', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders nothing when no layout is offered', () => {
    const { container } = render(
      <ViewSwitcher value="grid" onChange={() => {}} layouts={[]} storageKey={STORAGE_KEY} />,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('shows a single layout as a fixed label instead of a radio group', () => {
    const { container } = render(
      <ViewSwitcher
        value="grid"
        onChange={() => {}}
        layouts={['grid']}
        labels={{ grid: 'Grade' }}
        ariaLabel="Formato da biblioteca"
      />,
    );

    const fixed = container.querySelector('.ui-view-switcher-fixed');
    expect(fixed?.textContent).toBe('Grade');
    expect(fixed?.getAttribute('data-layout')).toBe('grid');
    expect(fixed?.getAttribute('title')).toBe('Formato da biblioteca');
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('ignores the stored preference while the screen is locked to one layout', () => {
    window.localStorage.setItem(STORAGE_KEY, 'list');
    const onChange = vi.fn();

    render(
      <ViewSwitcher value="grid" onChange={onChange} layouts={['grid']} storageKey={STORAGE_KEY} />,
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
