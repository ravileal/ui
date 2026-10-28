import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from './components/Alert';
import { Badge, Chip } from './components/Badge';
import Button, { IconButton } from './components/Button';
import Portal from './components/Portal';
import ProgressBar from './components/ProgressBar';
import Spinner from './components/Spinner';
import VisuallyHidden from './components/VisuallyHidden';

describe('Button', () => {
  it('renders the primary variant by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('ui-button', 'ui-button--primary', 'ui-button--md');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant, size and full-width classes', () => {
    render(
      <Button variant="danger" size="lg" fullWidth>
        Delete
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'ui-button--danger',
      'ui-button--lg',
      'is-full',
    );
  });

  it('disables while loading and renders a status spinner', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: 'Loading Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders leading and trailing icons', () => {
    render(
      <Button leadingIcon={<span>+</span>} trailingIcon={<span>→</span>}>
        Add
      </Button>,
    );
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('provides an accessible icon-only button', () => {
    render(
      <IconButton aria-label="Open settings">
        <span aria-hidden="true">⚙</span>
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Open settings' })).toHaveClass('ui-button--icon');
  });
});

describe('Spinner', () => {
  it('exposes a status with a label and size', () => {
    render(<Spinner size={24} label="Loading data" />);
    const status = screen.getByRole('status', { name: 'Loading data' });
    expect(status.querySelector('.ui-spinner')).toHaveStyle({ width: '24px', height: '24px' });
  });
});

describe('ProgressBar', () => {
  it('exposes determinate values', () => {
    render(<ProgressBar value={25} max={100} label="Upload" />);
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(progress).toHaveAttribute('aria-valuenow', '25');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress.querySelector('.ui-progress-bar')).toHaveStyle({ width: '25%' });
  });

  it('omits aria-valuenow for indeterminate progress', () => {
    render(<ProgressBar label="Loading" />);
    const progress = screen.getByRole('progressbar', { name: 'Loading' });
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveClass('is-indeterminate');
  });
});

describe('Badge and Chip', () => {
  it('applies tone and variant classes', () => {
    render(
      <Badge tone="success" variant="outline" dot>
        Paid
      </Badge>,
    );
    const badge = screen.getByText('Paid').closest('.ui-badge')!;
    expect(badge).toHaveClass('ui-badge--success', 'ui-badge--outline');
    expect(badge.querySelector('.ui-badge-dot')).toBeInTheDocument();
  });

  it('removes a chip through its accessible remove button', async () => {
    const onRemove = vi.fn();
    render(
      <Chip tone="info" onRemove={onRemove} removeLabel="Remove Food">
        Food
      </Chip>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove Food' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe('Alert', () => {
  it('uses alert semantics for danger and status for info', () => {
    const { rerender } = render(<Alert tone="danger">Failed</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    rerender(<Alert tone="info">Heads up</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Heads up');
  });

  it('renders title, action and dismiss button', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert title="Heads up" action={<button type="button">Retry</button>} onDismiss={onDismiss}>
        Message
      </Alert>,
    );
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('VisuallyHidden and Portal', () => {
  it('hides content visually', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    expect(screen.getByText('Screen reader text')).toHaveClass('ui-visually-hidden');
  });

  it('renders children into the document body after mount', async () => {
    render(
      <Portal>
        <div>portal content</div>
      </Portal>,
    );
    await waitFor(() => expect(screen.getByText('portal content')).toBeInTheDocument());
  });
});
