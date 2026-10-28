import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ConfirmModal from './components/ConfirmModal';
import { ColorPicker } from './components/ColorPicker';
import DatePicker from './components/DatePicker';
import Dropdown from './components/Dropdown';
import { InlineEditorCard } from './components/InlineEditorCard';
import Modal from './components/Modal';

expect.extend(toHaveNoViolations);

describe('accessibility', () => {
  it('Modal has no violations', async () => {
    const { container } = render(
      <Modal open title="Settings" onClose={vi.fn()}>
        <button type="button">Save</button>
      </Modal>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ConfirmModal has no violations', async () => {
    const { container } = render(
      <ConfirmModal
        open
        title="Delete item"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Dropdown has no violations when open', async () => {
    const { container } = render(
      <Dropdown
        ariaLabel="Category"
        value=""
        onChange={vi.fn()}
        options={[
          { value: '', label: '—' },
          { value: 'food', label: 'Food' },
        ]}
      />,
    );
    await userEvent.click(container.querySelector('button')!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DatePicker has no violations when open', async () => {
    const { container } = render(<DatePicker value="2026-03-30" onChange={vi.fn()} />);
    await userEvent.click(container.querySelector('button')!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ColorPicker has no violations when open', async () => {
    const { container } = render(
      <ColorPicker value="#00c9a7" onChange={vi.fn()} presets={['#00c9a7']} />,
    );
    await userEvent.click(container.querySelector('button')!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('InlineEditorCard has no violations', async () => {
    const { container } = render(
      <InlineEditorCard title="Edit alias" onSave={vi.fn()} onCancel={vi.fn()}>
        <label>
          Alias
          <input />
        </label>
      </InlineEditorCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
