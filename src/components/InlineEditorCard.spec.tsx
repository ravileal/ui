import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineEditorCard } from './InlineEditorCard';

describe('InlineEditorCard', () => {
  it('renders the title, children and actions', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEditorCard title="Edit alias" onSave={onSave} onCancel={onCancel}>
        <input aria-label="Alias" />
      </InlineEditorCard>,
    );

    expect(screen.getByText('Edit alias')).toBeInTheDocument();
    expect(screen.getByLabelText('Alias')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables save and supports custom labels', () => {
    render(
      <InlineEditorCard
        title="Edit"
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saveDisabled
        saveLabel="Salvar"
        cancelLabel="Cancelar"
      >
        content
      </InlineEditorCard>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });
});
