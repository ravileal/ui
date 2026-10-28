import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyValue from './CopyValue';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CopyValue', () => {
  it('renders the provided display text', () => {
    render(
      <CopyValue value={120} ariaLabel="Copy total">
        $120.00
      </CopyValue>,
    );
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('copies the raw value by default on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(
      <CopyValue value={1234.5} ariaLabel="Copy total" tooltipLabel="Month total">
        $1,234.50
      </CopyValue>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Copy total' }));

    expect(writeText).toHaveBeenCalledWith('1234.5');
    expect(await screen.findByText('✓ Copied')).toBeInTheDocument();
  });

  it('uses the injected formatter and copy serializer', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(
      <CopyValue
        value={1234.5}
        ariaLabel="Copy total"
        formatValue={(value) => `$${Number(value).toFixed(2)}`}
        copyValue={(value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      />,
    );

    expect(screen.getByText('$1234.50')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Copy total' }));
    expect(writeText).toHaveBeenCalledWith('1,234.50');
  });
});
