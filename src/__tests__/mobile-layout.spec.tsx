import { describe, expect, it } from 'vitest';
// Node built-ins are available at test time but are not part of this project's
// ambient types, which only pull in vitest and jest-dom.
// @ts-expect-error -- node:fs has no ambient types in this tsconfig
import { readFileSync } from 'node:fs';

/**
 * jsdom evaluates no media query, so the mobile rules of the kit are asserted
 * on the stylesheet itself. This file is the other half of the DOM contracts in
 * DataTable.spec.tsx and AppHeader.spec.tsx: the component keeps the hook, the
 * stylesheet owns the phone layout.
 */
const stylesheet = readFileSync('src/styles.css', 'utf8');

interface Rule {
  /** At-rule preludes that wrap the block, outermost first, e.g. `@media (max-width: 720px)`. */
  media: string[];
  selectors: string[];
  body: string;
}

/** Flattens every declaration block while remembering the at-rules around it. */
function collectRules(source: string, media: string[] = [], out: Rule[] = []): Rule[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  let buffer = '';
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (char === '{') {
      const selectorText = buffer.trim();
      let depth = 1;
      let end = index + 1;

      while (end < text.length && depth > 0) {
        if (text[end] === '{') depth += 1;
        else if (text[end] === '}') depth -= 1;
        end += 1;
      }

      const inner = text.slice(index + 1, end - 1);
      if (selectorText.startsWith('@')) {
        collectRules(inner, [...media, selectorText], out);
      } else {
        out.push({
          media,
          selectors: selectorText
            .split(',')
            .map((selector) => selector.trim())
            .filter(Boolean),
          body: inner,
        });
      }

      buffer = '';
      index = end;
      continue;
    }

    if (char === '}') {
      buffer = '';
      index += 1;
      continue;
    }

    buffer += char;
    index += 1;
  }

  return out;
}

const rules = collectRules(stylesheet);

/** Matches `property: value` as a whole declaration, not as a substring. */
const declaration = (property: string, value = '[^;]+') =>
  new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*${value}\\s*(?:;|$)`);

const inMedia = (breakpoint: string) => (rule: Rule) =>
  rule.media.some((prelude) => prelude.includes(breakpoint));
const atTopLevel = (rule: Rule) => rule.media.length === 0;

/** First rule that declares `selector`, optionally scoped to a media condition. */
const ruleFor = (selector: string, scope: (rule: Rule) => boolean = atTopLevel) =>
  rules.find((rule) => scope(rule) && rule.selectors.includes(selector));

describe('DataTable column alignment is CSS-owned', () => {
  it('still defaults a header cell to a left column', () => {
    // A `th` centres by UA default; the kit's default column is left, which the
    // inline style used to force before `data-align` took over.
    const header = ruleFor('.ui-data-table th');
    expect(header?.body).toMatch(declaration('text-align', 'left'));
  });

  it('centres and right-aligns a column from the attribute, for both cells', () => {
    const center = ruleFor('.ui-data-table th[data-align=\'center\']');
    const right = ruleFor('.ui-data-table th[data-align=\'right\']');

    expect(center?.selectors).toEqual([
      '.ui-data-table th[data-align=\'center\']',
      '.ui-data-table td[data-align=\'center\']',
    ]);
    expect(center?.body).toMatch(declaration('text-align', 'center'));

    expect(right?.selectors).toEqual([
      '.ui-data-table th[data-align=\'right\']',
      '.ui-data-table td[data-align=\'right\']',
    ]);
    expect(right?.body).toMatch(declaration('text-align', 'right'));
  });

  it('drops the column alignment inside a stacked card: one card, one edge', () => {
    // The stacked block lives in the 640px media query, the narrowest of the
    // table's breakpoints; 390px is inside it, a tablet is not.
    const card = ruleFor(
      '.ui-data-table-wrap.is-stacked td:not(.ui-data-table-empty)',
      inMedia('max-width: 640px'),
    );

    expect(card, 'the stacked card must overrule the desktop alignment').toBeDefined();
    expect(card?.body).toMatch(declaration('text-align', 'left'));
    // The label is a `::before` grid item, so it needs the same edge: the rule
    // has to cover both the cell and its label pseudo-element.
    expect(card?.selectors).toContain(
      '.ui-data-table-wrap.is-stacked td:not(.ui-data-table-empty)::before',
    );
  });

  it('keeps the empty state centred in a stacked card', () => {
    const empty = ruleFor(
      '.ui-data-table-wrap.is-stacked .ui-data-table-empty',
      inMedia('max-width: 640px'),
    );

    expect(empty?.body).toMatch(declaration('text-align', 'center'));
  });
});

describe('Badge centres its own label', () => {
  it('sets justify-content without touching padding or the tone recipes', () => {
    const badge = ruleFor('.ui-badge');

    expect(badge?.body).toMatch(declaration('justify-content', 'center'));
    // Guard-rail: the pill geometry is not part of this fix.
    expect(badge?.body).toMatch(declaration('padding', '2px\\s+8px'));
    expect(badge?.body).toMatch(declaration('display', 'inline-flex'));
  });
});

describe('AppHeader keeps the section switcher on the bar', () => {
  it('lets the bar wrap only when the row overflows', () => {
    const inner = ruleFor('.ui-app-header-inner');

    expect(inner?.body).toMatch(declaration('flex-wrap', 'wrap'));
  });

  it('lets the switcher flow inline on a phone instead of claiming a row', () => {
    const nav = ruleFor('.ui-app-header-nav', inMedia('max-width: 720px'));

    expect(nav, 'the 720px block must style the switcher').toBeDefined();
    expect(nav?.body).toMatch(declaration('flex', '0\\s+1\\s+auto'));
    expect(nav?.body).toMatch(declaration('min-width', '0'));
    // The two declarations that forced the second row at 390px.
    expect(nav?.body).not.toMatch(/flex-basis/);
    expect(nav?.body).not.toMatch(declaration('order', '3'));
  });

  it('compacts the brand and the segment gutters for a 390px phone', () => {
    const brand = ruleFor('.ui-app-header-brand', inMedia('max-width: 720px'));
    const item = ruleFor('.ui-segmented--lg .ui-segmented-item', inMedia('max-width: 480px'));

    expect(brand?.body).toMatch(declaration('font-size', '17px'));
    expect(item?.body).toMatch(declaration('padding', '0\\s+10px'));
  });
});
