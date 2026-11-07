import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from './Badge';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('anchors right by default and has no handle', async () => {
    render(
      <Drawer open onClose={vi.fn()} title="Filters">
        Body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveClass('ui-drawer', 'ui-drawer--right');
    expect(dialog.querySelector('.ui-drawer-handle')).toBeNull();
  });

  it('anchors bottom, shows the handle and takes a custom height', async () => {
    render(
      <Drawer open onClose={vi.fn()} title="Node" placement="bottom" height={480}>
        Body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Node' });
    expect(dialog).toHaveClass('ui-drawer--bottom');
    expect(dialog.querySelector('.ui-drawer-handle')).not.toBeNull();
    expect(dialog).toHaveStyle({ maxHeight: '480px' });
    // Side drawers size by width; a sheet must not inherit the 420px column.
    expect(dialog.style.width).toBe('');
  });

  it('defaults a bottom sheet to 62vh and can hide the handle', async () => {
    render(
      <Drawer open onClose={vi.fn()} title="Node" placement="bottom" handle={false}>
        Body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Node' });
    expect(dialog).toHaveStyle({ maxHeight: '62vh' });
    expect(dialog.querySelector('.ui-drawer-handle')).toBeNull();
  });

  it('renders a badge in the header next to the title', async () => {
    render(
      <Drawer
        open
        onClose={vi.fn()}
        title="Node 12"
        placement="bottom"
        badge={<Badge tone="info">anchor</Badge>}
      >
        Body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Node 12' });
    const badge = dialog.querySelector('.ui-drawer-badge');
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent('anchor');
    expect(badge?.closest('.ui-drawer-header')).not.toBeNull();
  });

  it('accepts a node title', async () => {
    render(
      <Drawer open onClose={vi.fn()} title={<span>Rich title</span>}>
        Body
      </Drawer>,
    );

    expect(await screen.findByRole('dialog', { name: 'Rich title' })).toBeInTheDocument();
  });

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    );
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click but not on panel click', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    );

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the footer', async () => {
    render(
      <Drawer open onClose={vi.fn()} title="Filters" footer={<button type="button">Apply</button>}>
        Body
      </Drawer>,
    );

    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: 'Apply' }).closest('.ui-drawer-footer')).not.toBeNull();
  });
});
