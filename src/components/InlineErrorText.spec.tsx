import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineErrorText from './InlineErrorText';

describe('InlineErrorText', () => {
  it('announces the message as an alert', () => {
    render(<InlineErrorText>Could not reach the executor</InlineErrorText>);
    const alert = screen.getByRole('alert');

    expect(alert.tagName).toBe('SPAN');
    expect(alert.className).toContain('ui-inline-error');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(screen.getByText('Could not reach the executor').className).toContain(
      'ui-inline-error-text',
    );
  });

  it('renders no retry control without a callback', () => {
    render(<InlineErrorText>Last run failed</InlineErrorText>);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('fires the retry callback once on click', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<InlineErrorText onRetry={onRetry}>Last run failed</InlineErrorText>);

    const button = screen.getByRole('button', { name: 'Retry' });
    expect(onRetry).not.toHaveBeenCalled();

    await user.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('uses the custom retry label', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <InlineErrorText onRetry={onRetry} retryLabel="Try again">
        Sync failed
      </InlineErrorText>,
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('stretches with the block modifier', () => {
    const { container, rerender } = render(<InlineErrorText>Offline</InlineErrorText>);
    expect(container.querySelector('.ui-inline-error')?.className).not.toContain(
      'ui-inline-error--block',
    );

    rerender(<InlineErrorText block>Offline</InlineErrorText>);
    expect(container.querySelector('.ui-inline-error')?.className).toContain(
      'ui-inline-error--block',
    );
  });

  it('merges the consumer className and forwards style', () => {
    const { container } = render(
      <InlineErrorText className="row-error" style={{ marginTop: 6 }}>
        Timed out
      </InlineErrorText>,
    );
    const alert = container.querySelector('.ui-inline-error') as HTMLElement;

    expect(alert.className).toContain('row-error');
    expect(alert.style.marginTop).toBe('6px');
  });
});
