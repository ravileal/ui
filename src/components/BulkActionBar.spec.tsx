import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BulkActionBar from './BulkActionBar';

describe('BulkActionBar', () => {
  it('renders the selection count, summary and actions', async () => {
    const onCopy = vi.fn();
    const onClear = vi.fn();
    render(
      <BulkActionBar
        count={2}
        summary={<>Total: $10.00</>}
        onClear={onClear}
        actions={[{ key: 'copy', label: 'Copy', onClick: onCopy }]}
        dangerAction={{ label: 'Delete 2', onClick: vi.fn() }}
      />,
    );

    expect(screen.getByRole('toolbar', { name: 'Selection actions' })).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('Total: $10.00')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onCopy).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /Deselect/ }));
    expect(onClear).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Delete 2' })).toHaveClass('ui-button--danger');
  });

  it('uses the singular label and a custom count label', () => {
    const { rerender } = render(<BulkActionBar count={1} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();

    rerender(<BulkActionBar count={3} countLabel={(count) => `${count} selecionados`} />);
    expect(screen.getByText('3 selecionados')).toBeInTheDocument();
  });

  it('renders custom children controls between actions and the danger action', () => {
    render(
      <BulkActionBar count={1} dangerAction={{ label: 'Delete', onClick: vi.fn() }}>
        <span>Assign</span>
      </BulkActionBar>,
    );
    expect(screen.getByText('Assign')).toBeInTheDocument();
  });
});
