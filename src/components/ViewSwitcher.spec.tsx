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
    expect(options.map((option) => option.textContent)).toEqual(['Grid', 'List', 'Adaptive']);
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
    expect(options.map((option) => option.textContent)).toEqual(['Cards', 'Rows']);
    expect(screen.getByRole('radiogroup', { name: 'Show as' })).toBeInTheDocument();
  });

  it('uses the small segmented control, never a native select', () => {
    const { container } = render(<ViewSwitcher value="grid" onChange={() => {}} />);

    expect(container.querySelector('.ui-segmented--sm')).not.toBeNull();
    expect(container.querySelector('select')).toBeNull();
  });

  it('renders icon segments with the accessible name and no visible text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ViewSwitcher value="grid" onChange={onChange} icons={{ grid: <svg />, list: <svg /> }} />,
    );

    const grid = screen.getByRole('radio', { name: 'Grid' });
    const list = screen.getByRole('radio', { name: 'List' });
    expect(grid).toHaveAttribute('aria-label', 'Grid');
    expect(grid).toHaveAttribute('title', 'Grid');
    expect(list).toHaveAttribute('aria-label', 'List');
    expect(grid.textContent).toBe('');
    expect(grid.querySelector('.ui-view-switcher-icon')?.getAttribute('aria-hidden')).toBe('true');

    // A layout without an icon keeps the text label.
    expect(screen.getByRole('radio', { name: 'Adaptive' }).textContent).toBe('Adaptive');

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
