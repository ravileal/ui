import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardBody, CardFooter, CardHeader, Section } from './components/Card';
import EmptyState from './components/EmptyState';
import PageHeader from './components/PageHeader';

describe('Card and Section', () => {
  it('renders a card with header, body and footer', () => {
    render(
      <Card padding="none">
        <CardHeader title="Aliases" subtitle="Description aliases" actions={<button>New</button>} />
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Aliases')).toBeInTheDocument();
    expect(screen.getByText('Description aliases')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders a section with the standard body padding', () => {
    render(
      <Section title="Notifications" subtitle="When to remind you">
        Content
      </Section>,
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders icon, title, description and action', async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<span>+</span>}
        title="No aliases"
        description="Create your first alias."
        action={<button onClick={onClick}>New alias</button>}
      />,
    );
    expect(screen.getByText('No aliases')).toBeInTheDocument();
    expect(screen.getByText('Create your first alias.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'New alias' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PageHeader', () => {
  it('renders title, subtitle, back and actions', async () => {
    const onBack = vi.fn();
    render(
      <PageHeader
        title="Transactions"
        subtitle="October 2026"
        onBack={onBack}
        actions={<button>Export</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(screen.getByText('October 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
