import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('shows the content on hover and hides on leave', async () => {
    render(
      <Tooltip content="raw merchant name" delay={0}>
        <span>Friendly name</span>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('Friendly name'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('raw merchant name');

    await userEvent.unhover(screen.getByText('Friendly name'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders the children as the trigger', () => {
    render(
      <Tooltip content="tip">
        <span>visible label</span>
      </Tooltip>,
    );
    expect(screen.getByText('visible label')).toBeInTheDocument();
  });

  it('stays open when focus moves away while the pointer is still over the trigger', async () => {
    render(
      <div>
        <Tooltip content="tip" delay={0}>
          <button>Trigger</button>
        </Tooltip>
        <button>Other</button>
      </div>,
    );
    const trigger = screen.getByText('Trigger');
    await userEvent.hover(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // e.g. the legacy clipboard textarea stealing focus mid-copy
    (screen.getByText('Other') as HTMLButtonElement).focus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await userEvent.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps the content width instead of collapsing to the longest word', async () => {
    render(
      <Tooltip content="a tooltip with a reasonably long sentence" delay={0} maxWidth={4000}>
        <span>Trigger</span>
      </Tooltip>,
    );

    await userEvent.hover(screen.getByText('Trigger'));

    const panel = screen.getByRole('tooltip');
    // Without an explicit width the panel shrinks to its minimum content size
    // when positioned near the viewport edge (one word per line).
    expect(panel.style.width).toBe('max-content');
    expect(panel.style.overflowWrap).toBe('break-word');
    // max-width never exceeds the viewport (1024px in jsdom) minus the paddings.
    expect(panel.style.maxWidth).toBe('1008px');
  });

  it('keeps the panel inside the viewport when the trigger is near the right edge', async () => {
    const innerWidthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth',
    );
    const offsetHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight',
    );
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 1000,
      right: 1010,
      top: 100,
      bottom: 120,
      width: 10,
      height: 20,
      x: 1000,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 260,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 100,
    });

    try {
      render(
        <Tooltip content="edge tooltip" delay={0}>
          <span>Trigger</span>
        </Tooltip>,
      );
      await userEvent.hover(screen.getByText('Trigger'));

      const panel = screen.getByRole('tooltip');
      // centered on the trigger would overflow: 1005 + 130 > 1024
      expect(parseFloat(panel.style.left)).toBe(1024 - 130 - 8);
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', offsetWidthDescriptor!);
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeightDescriptor!);
      Object.defineProperty(window, 'innerWidth', innerWidthDescriptor!);
    }
  });

  function mockLayout(
    rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height'>,
    panel: { width: number; height: number },
  ): () => void {
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth',
    );
    const offsetHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight',
    );
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      ...rect,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => panel.width,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => panel.height,
    });
    return () => {
      rectSpy.mockRestore();
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', offsetWidthDescriptor!);
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeightDescriptor!);
    };
  }

  it('shows above the trigger whenever there is room above', async () => {
    const restore = mockLayout(
      { left: 400, right: 420, top: 300, bottom: 320, width: 20, height: 20 },
      { width: 200, height: 100 },
    );
    try {
      render(
        <Tooltip content="plenty of room above" delay={0}>
          <span>Trigger</span>
        </Tooltip>,
      );
      await userEvent.hover(screen.getByText('Trigger'));

      const panel = screen.getByRole('tooltip');
      expect(panel.style.top).toBe(`${320 - 20 - 8}px`); // rect.top - GAP
      expect(panel.style.transform).toBe('translate(-50%, -100%)');
    } finally {
      restore();
    }
  });

  it('drops below only when there is no room above', async () => {
    const restore = mockLayout(
      { left: 400, right: 420, top: 50, bottom: 70, width: 20, height: 20 },
      { width: 200, height: 100 },
    );
    try {
      render(
        <Tooltip content="no room above" delay={0}>
          <span>Trigger</span>
        </Tooltip>,
      );
      await userEvent.hover(screen.getByText('Trigger'));

      const panel = screen.getByRole('tooltip');
      expect(panel.style.top).toBe(`${70 + 8}px`); // rect.bottom + GAP
      expect(panel.style.transform).toBe('translate(-50%, 0)');
    } finally {
      restore();
    }
  });
});
