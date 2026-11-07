import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Tone } from '../internal/tone';
import ToneText from './ToneText';

const TONES: Tone[] = ['neutral', 'info', 'success', 'warning', 'danger', 'accent', 'purple'];

describe('ToneText', () => {
  it('renders a span with the base class by default', () => {
    render(<ToneText>Ready</ToneText>);
    const text = screen.getByText('Ready');

    expect(text.tagName).toBe('SPAN');
    expect(text.className).toContain('ui-tone-text');
    expect(text.className).toContain('ui-tone-text--neutral');
    expect(text.className).toContain('ui-tone-text--md');
    expect(text.className).toContain('ui-tone-text--semibold');
  });

  it('applies one modifier per tone', () => {
    const { container } = render(
      <div>
        {TONES.map((tone) => (
          <ToneText key={tone} tone={tone}>
            {tone}
          </ToneText>
        ))}
      </div>,
    );

    const texts = container.querySelectorAll('.ui-tone-text');
    expect(texts).toHaveLength(TONES.length);
    TONES.forEach((tone, index) => {
      expect(texts[index].className).toContain(`ui-tone-text--${tone}`);
    });
  });

  it('switches between the row and the subordinate size', () => {
    const { container, rerender } = render(<ToneText size="sm">Queued</ToneText>);
    expect(container.querySelector('.ui-tone-text')?.className).toContain('ui-tone-text--sm');
    expect(container.querySelector('.ui-tone-text')?.className).not.toContain('ui-tone-text--md');

    rerender(<ToneText size="md">Queued</ToneText>);
    expect(container.querySelector('.ui-tone-text')?.className).toContain('ui-tone-text--md');
    expect(container.querySelector('.ui-tone-text')?.className).not.toContain('ui-tone-text--sm');
  });

  it('sets the medium weight modifier when asked', () => {
    const { container, rerender } = render(<ToneText>Queued</ToneText>);
    expect(container.querySelector('.ui-tone-text')?.className).toContain('ui-tone-text--semibold');

    rerender(<ToneText weight="medium">Queued</ToneText>);
    const text = container.querySelector('.ui-tone-text');
    expect(text?.className).toContain('ui-tone-text--medium');
    expect(text?.className).not.toContain('ui-tone-text--semibold');
  });

  it('adds tabular figures only when requested', () => {
    const { container, rerender } = render(<ToneText>14:02</ToneText>);
    expect(container.querySelector('.ui-tone-text')?.className).not.toContain(
      'ui-tone-text--tabular',
    );

    rerender(<ToneText tabular>14:02</ToneText>);
    expect(container.querySelector('.ui-tone-text')?.className).toContain('ui-tone-text--tabular');
  });

  it('renders the requested element', () => {
    const { container, rerender } = render(<ToneText as="strong">Failed</ToneText>);
    expect(container.querySelector('strong')?.textContent).toBe('Failed');

    rerender(
      <ToneText as="p" size="sm">
        Last run failed
      </ToneText>,
    );
    const paragraph = container.querySelector('p');
    expect(paragraph?.className).toContain('ui-tone-text');
    expect(paragraph?.textContent).toBe('Last run failed');
  });

  it('merges the consumer className and forwards title and style', () => {
    const { container } = render(
      <ToneText className="row-state" style={{ marginLeft: 4 }} title="Job state">
        Running
      </ToneText>,
    );
    const text = container.querySelector('.ui-tone-text') as HTMLElement;

    expect(text.className).toContain('row-state');
    expect(text.getAttribute('title')).toBe('Job state');
    expect(text.style.marginLeft).toBe('4px');
  });
});
