import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressStatusPanel from './ProgressStatusPanel';

describe('ProgressStatusPanel', () => {
  it('renders the heading, percentage and per-item statuses', () => {
    render(
      <ProgressStatusPanel
        title="Parsing invoices…"
        percent={75}
        progressLabel="Invoice search progress"
        items={[
          { id: 'a', label: 'Nubank', status: 'done', detail: '12 lines' },
          { id: 'b', label: 'Inter', status: 'error', detail: 'No documents found' },
        ]}
      />,
    );

    expect(screen.getByText('Parsing invoices…')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getByText('12 lines')).toBeInTheDocument();
    expect(screen.getByText('No documents found')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Invoice search progress' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
  });

  it('renders an indeterminate bar when percent is omitted', () => {
    render(<ProgressStatusPanel title="Connecting…" progressLabel="Search" />);
    expect(screen.getByRole('progressbar', { name: 'Search' })).not.toHaveAttribute(
      'aria-valuenow',
    );
  });

  it('applies the danger tone to the heading and bar', () => {
    render(<ProgressStatusPanel title="Failed" percent={0} tone="danger" progressLabel="Search" />);
    expect(screen.getByText('Failed')).toHaveClass('is-error');
    expect(screen.getByRole('progressbar', { name: 'Search' })).toHaveClass(
      'ui-progress',
      'ui-progress--danger',
    );
  });
});
