import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RowActions } from './RowActions';

describe('RowActions', () => {
  it('calls edit and asks for confirmation before delete', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<RowActions onEdit={onEdit} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('deletes immediately when confirmation is disabled and supports labels', async () => {
    const onDelete = vi.fn();
    render(
      <RowActions
        onEdit={vi.fn()}
        onDelete={onDelete}
        confirmDelete={false}
        deleteLabel="Excluir"
        cancelLabel="Cancelar"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });
});
