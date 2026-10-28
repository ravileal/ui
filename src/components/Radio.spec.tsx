import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Radio from './Radio';

function DestinationGroup() {
  const [destination, setDestination] = useState('download');
  return (
    <div>
      <label>
        <Radio
          name="destination"
          value="download"
          checked={destination === 'download'}
          onChange={() => setDestination('download')}
        />
        Download .csv
      </label>
      <label>
        <Radio
          name="destination"
          value="clipboard"
          checked={destination === 'clipboard'}
          onChange={() => setDestination('clipboard')}
        />
        Copy to clipboard
      </label>
    </div>
  );
}

describe('Radio', () => {
  it('renders an accessible radio with the design-system class', () => {
    render(<Radio aria-label="Download" name="destination" />);
    const radio = screen.getByRole('radio', { name: 'Download' });
    expect(radio).toHaveClass('ui-radio');
    expect(radio).not.toBeChecked();
  });

  it('selects a single option in the group when labelled', async () => {
    render(<DestinationGroup />);
    const download = screen.getByRole('radio', { name: 'Download .csv' });
    const clipboard = screen.getByRole('radio', { name: 'Copy to clipboard' });

    expect(download).toBeChecked();
    expect(clipboard).not.toBeChecked();

    await userEvent.click(screen.getByText('Copy to clipboard'));

    expect(download).not.toBeChecked();
    expect(clipboard).toBeChecked();
  });

  it('applies the compact size token', () => {
    render(<Radio aria-label="Compact" name="compact" size="sm" />);
    expect(screen.getByRole('radio', { name: 'Compact' })).toHaveClass('is-sm');
  });

  it('keeps the native disabled behaviour', async () => {
    const onChange = vi.fn();
    render(<Radio aria-label="Locked" name="locked" disabled onChange={onChange} />);
    const radio = screen.getByRole('radio', { name: 'Locked' });
    await userEvent.click(radio);
    expect(onChange).not.toHaveBeenCalled();
    expect(radio).toBeDisabled();
  });
});
