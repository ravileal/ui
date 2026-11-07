import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from './Badge';

describe('Chip', () => {
  it('stays an inert span when it has no onClick or href', () => {
    const { container } = render(<Chip tone="info">Grocery</Chip>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('ui-badge', 'ui-chip');
    expect(root).not.toHaveClass('ui-chip--interactive');
    expect(root).not.toHaveClass('ui-chip--disabled');
    expect(root.querySelector('button')).toBeNull();
    expect(root.querySelector('a')).toBeNull();
    // TagInput's shape: icon + label as direct children of the pill.
    expect(root.querySelector('.ui-chip-label')).toHaveTextContent('Grocery');
  });

  it('fires onClick from a real button', async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Anchor A</Chip>);

    const trigger = screen.getByRole('button', { name: 'Anchor A' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger.closest('.ui-chip')).toHaveClass('ui-chip--interactive');

    await userEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an anchor when href is given', () => {
    render(<Chip href="/anchors/42">Anchor B</Chip>);

    const link = screen.getByRole('link', { name: 'Anchor B' });
    expect(link).toHaveAttribute('href', '/anchors/42');
    expect(screen.queryByRole('button', { name: 'Anchor B' })).not.toBeInTheDocument();
  });

  it('emits aria-pressed only when pressed is defined', () => {
    const { rerender } = render(
      <Chip onClick={() => {}} pressed>
        Toggle on
      </Chip>,
    );
    expect(screen.getByRole('button', { name: 'Toggle on' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    rerender(
      <Chip onClick={() => {}} pressed={false}>
        Toggle off
      </Chip>,
    );
    expect(screen.getByRole('button', { name: 'Toggle off' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    rerender(<Chip onClick={() => {}}>Plain</Chip>);
    expect(screen.getByRole('button', { name: 'Plain' })).not.toHaveAttribute('aria-pressed');
  });

  it('blocks the click while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Chip onClick={onClick} disabled>
        Disabled chip
      </Chip>,
    );

    const trigger = screen.getByRole('button', { name: 'Disabled chip' });
    expect(trigger).toBeDisabled();
    expect(trigger.closest('.ui-chip')).toHaveClass('ui-chip--disabled');

    await userEvent.click(trigger);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps the remove button usable and outside the trigger', async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Chip onClick={onClick} onRemove={onRemove} removeLabel="Remove Grocery">
        Grocery
      </Chip>,
    );

    const root = screen.getByRole('button', { name: 'Grocery' }).closest('.ui-chip') as HTMLElement;
    const remove = screen.getByRole('button', { name: 'Remove Grocery' });

    // Sibling, not a nested control: a button inside a button is invalid HTML
    // and the inner one swallows the outer click.
    expect(remove.parentElement).toBe(root);
    expect(remove.closest('button')).toBe(remove);
    expect(root.querySelector('button button')).toBeNull();

    await userEvent.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
