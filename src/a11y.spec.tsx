import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Alert from './components/Alert';
import Button from './components/Button';
import Combobox from './components/Combobox';
import ConfirmModal from './components/ConfirmModal';
import { ColorPicker } from './components/ColorPicker';
import { DataTable } from './components/DataTable';
import DatePicker from './components/DatePicker';
import { Drawer } from './components/Drawer';
import Dropdown from './components/Dropdown';
import { FileUpload } from './components/FileUpload';
import FormField from './components/FormField';
import { InlineEditorCard } from './components/InlineEditorCard';
import Modal from './components/Modal';
import Switch from './components/Switch';
import { Tabs } from './components/Tabs';
import TextInput from './components/TextInput';

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

  it('Button, form field and switch have no violations', async () => {
    const { container } = render(
      <div>
        <Button>Save</Button>
        <FormField label="Name" hint="Your display name" error="Required">
          <TextInput />
        </FormField>
        <Switch checked={false} onChange={vi.fn()} label="Notifications" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Alert and Tabs have no violations', async () => {
    const { container } = render(
      <div>
        <Alert tone="warning" title="Heads up">
          Message
        </Alert>
        <Tabs
          ariaLabel="Views"
          value="list"
          onChange={vi.fn()}
          items={[
            { id: 'list', label: 'List' },
            { id: 'chart', label: 'Chart' },
          ]}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Combobox has no violations when open', async () => {
    const { container } = render(
      <Combobox
        value=""
        onChange={vi.fn()}
        ariaLabel="Category"
        options={[
          { value: 'food', label: 'Food' },
          { value: 'home', label: 'Home' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Drawer has no violations', async () => {
    render(
      <Drawer open onClose={vi.fn()} title="Filters">
        Drawer content
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('DataTable and FileUpload have no violations', async () => {
    const { container } = render(
      <div>
        <DataTable
          ariaLabel="Transactions"
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'amount', header: 'Amount' },
          ]}
          rows={[{ name: 'Coffee', amount: 12 }]}
          rowKey={(row) => row.name}
        />
        <FileUpload onFiles={vi.fn()} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
