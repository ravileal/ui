import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Node built-ins are available at test time but are not part of this project's
// ambient types, which only pull in vitest and jest-dom.
// @ts-expect-error -- node:fs has no ambient types in this tsconfig
import { readFileSync } from 'node:fs';
import { ColorPicker } from '../components/ColorPicker';

const stylesheet = readFileSync('src/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const PANEL_CLASS = 'ui-color-picker-panel';

/**
 * Declarations of every block whose selector list targets the panel class.
 * The panel carries the menu's padding, so those declarations are what keeps
 * that padding inside the panel's own width instead of adding it on top.
 */
function panelDeclarations(): string[] {
  const pattern = new RegExp(`(?:^|[^\\w-])\\.${PANEL_CLASS}(?![\\w-])[^{}]*\\{([^}]*)\\}`, 'g');
  return [...stylesheet.matchAll(pattern)].map((match) => match[1]);
}

describe('ColorPicker panel box model', () => {
  it('counts its own padding inside its width', () => {
    const declarations = panelDeclarations();

    expect(declarations.length, `no rule block targets .${PANEL_CLASS}`).toBeGreaterThan(0);
    expect(
      declarations.some((body) => /box-sizing\s*:\s*border-box/.test(body)),
      `.${PANEL_CLASS} must declare box-sizing: border-box`,
    ).toBe(true);
    // A content-box panel adds its horizontal padding to the menu content
    // width, which is what produced the horizontal scrollbar.
    expect(
      declarations.every((body) => !/box-sizing\s*:\s*content-box/.test(body)),
      `.${PANEL_CLASS} must not fall back to content-box`,
    ).toBe(true);
  });

  it('lets the panel shrink to the menu content box', () => {
    const declarations = panelDeclarations();

    expect(
      declarations.some((body) => /(?:^|;)\s*min-width\s*:\s*0\s*(?:;|$)/.test(body)),
      `.${PANEL_CLASS} must declare min-width: 0 so its rows can shrink`,
    ).toBe(true);
  });

  it('leaves the box model to the stylesheet instead of inline styles', async () => {
    render(<ColorPicker value="#00c9a7" onChange={() => {}} presets={['#00c9a7']} ariaLabel="Panel" />);
    await userEvent.click(screen.getByLabelText('Panel'));

    const dialog = screen.getByRole('dialog', { name: 'Panel picker' });
    const panel = dialog.firstElementChild as HTMLElement;

    expect(panel).toHaveClass(PANEL_CLASS);
    // Inline padding/width was the content-box override that caused the
    // overflow; the panel must not carry one again.
    expect(panel.getAttribute('style')).toBeNull();
  });
});
