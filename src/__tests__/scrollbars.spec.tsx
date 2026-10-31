import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
// Node built-ins are available at test time but are not part of this project's
// ambient types, which only pull in vitest and jest-dom.
// @ts-expect-error -- node:fs has no ambient types in this tsconfig
import { readFileSync } from 'node:fs';
import { DataTable, type DataTableColumn } from '../components/DataTable';

const stylesheet = readFileSync('src/styles.css', 'utf8');

interface Rule {
  selectors: string[];
  body: string;
}

const withoutComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Collects every declaration block, including the ones nested in at-rules such
 * as `@media`. Nested blocks are flattened, which is enough to answer "which
 * classes scroll, and does the shared scrollbar block cover them".
 */
function collectRules(source: string): Rule[] {
  const rules: Rule[] = [];
  const text = withoutComments(source);
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
        rules.push(...collectRules(inner));
      } else {
        rules.push({
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

  return rules;
}

const rules = collectRules(stylesheet);

/** Matches `property: value` as a whole declaration, not as a substring. */
const declaration = (property: string, value = '[^;]+') =>
  new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*${value}\\s*(?:;|$)`);

const scrollsDeclaration = declaration('overflow(?:-x|-y)?', '(?:auto|scroll)');

/** Every class the package makes scrollable, in either axis. */
const SCROLL_CONTAINERS = [
  'ui-scroll-y',
  'ui-dropdown-menu',
  'ui-combobox-menu',
  'ui-sidebar-items',
  'ui-drawer-body',
  'ui-list-screen',
  'ui-data-table-wrap',
];

const classOf = (selector: string): string | null => selector.match(/^\.([\w-]+)/)?.[1] ?? null;

/** Classes reached by rules whose selectors contain `fragment`. */
const classesStyledWith = (fragment: string): Set<string> => {
  const found = rules.flatMap((rule) =>
    rule.selectors.filter((selector) => selector.includes(fragment)).map(classOf),
  );
  return new Set(found.filter((name): name is string => name !== null));
};

const scrollingClasses = [
  ...new Set(rules.filter((rule) => scrollsDeclaration.test(rule.body)).flatMap((rule) => rule.selectors.map(classOf))),
]
  .filter((name): name is string => name !== null)
  .sort();

const sharedRule = rules.find((rule) => declaration('scrollbar-width', 'thin').test(rule.body));
const sharedClasses = new Set(
  sharedRule ? sharedRule.selectors.map(classOf).filter((name): name is string => name !== null) : [],
);

const thumbRule = rules.find((rule) =>
  rule.selectors.some((selector) => selector.endsWith('::-webkit-scrollbar-thumb')),
);

describe('themed scrollbars', () => {
  it('finds every scroll container the stylesheet declares', () => {
    expect(scrollingClasses).toEqual([...SCROLL_CONTAINERS].sort());
  });

  it.each(SCROLL_CONTAINERS)('.%s joins the shared scrollbar block', (className) => {
    expect(
      sharedClasses.has(className),
      `.${className} scrolls but is missing from the shared scrollbar selector group`,
    ).toBe(true);
  });

  it('declares both engines in that one block', () => {
    expect(sharedRule, 'no rule declares scrollbar-width: thin').toBeDefined();
    expect(sharedRule?.body).toMatch(declaration('scrollbar-width', 'thin'));
    expect(sharedRule?.body).toMatch(declaration('scrollbar-color', 'var\\(--ui-border\\)\\s+transparent'));
  });

  it.each(SCROLL_CONTAINERS)('.%s sizes vertical and horizontal bars from the token', (className) => {
    const sized = rules.filter(
      (rule) =>
        rule.selectors.some((selector) => selector.endsWith('::-webkit-scrollbar') && classOf(selector) === className) &&
        declaration('width', 'var\\(--ui-scrollbar-size\\)').test(rule.body) &&
        declaration('height', 'var\\(--ui-scrollbar-size\\)').test(rule.body),
    );

    expect(sized.length, `.${className} does not size both axes from --ui-scrollbar-size`).toBeGreaterThan(0);
  });

  it('tints the thumb from theme tokens and ships no hardcoded colour', () => {
    expect(thumbRule, 'no ::-webkit-scrollbar-thumb rule found').toBeDefined();
    expect(thumbRule?.body).toMatch(declaration('background-color', 'var\\(--ui-border\\)'));
    expect(thumbRule?.body).toMatch(declaration('border-radius', 'var\\(--ui-scrollbar-radius\\)'));

    const scrollbarRules = rules.filter((rule) =>
      rule.selectors.some((selector) => selector.includes('::-webkit-scrollbar')),
    );
    expect(scrollbarRules.length).toBeGreaterThan(0);
    for (const rule of scrollbarRules) {
      expect(rule.body, `${rule.selectors.join(', ')} hardcodes a colour`).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it('tints the hovered thumb with the stronger text token', () => {
    const hover = rules.find((rule) =>
      rule.selectors.some((selector) => selector.endsWith('::-webkit-scrollbar-thumb:hover')),
    );

    expect(hover?.body).toMatch(declaration('background-color', 'var\\(--ui-text-3\\)'));
  });

  it('insets the table thumb so it clears the wrapper border and 12px radius', () => {
    const wrapRule = rules.find(
      (rule) =>
        rule.selectors.some((selector) => selector === '.ui-data-table-wrap') &&
        declaration('border-radius', '12px').test(rule.body),
    );

    expect(wrapRule, '.ui-data-table-wrap must keep its 12px radius').toBeDefined();
    expect(wrapRule?.body).toMatch(declaration('--ui-scrollbar-thumb-inset'));
    expect(wrapRule?.body).toMatch(declaration('--ui-scrollbar-size'));
    // The inset only takes effect through the padding-box clip that the thumb
    // (and only the thumb) declares; without it the border would paint.
    expect(thumbRule?.body).toMatch(declaration('border', 'var\\(--ui-scrollbar-thumb-inset,\\s*0\\)\\s+solid\\s+transparent'));
    expect(thumbRule?.body).toMatch(declaration('background-clip', 'padding-box'));
  });

  it('leaves the stacked table out of the scroll treatment', () => {
    const stacked = rules.find((rule) =>
      rule.selectors.some((selector) => selector === '.ui-data-table-wrap.is-stacked'),
    );

    expect(stacked?.body).toMatch(declaration('overflow', 'visible'));
    expect(stacked?.body).not.toMatch(/scrollbar-/);
  });

  it('keeps the vertical bars and the horizontal table bar on the same treatment', () => {
    const vertical = classesStyledWith('::-webkit-scrollbar');
    expect(vertical.has('ui-data-table-wrap')).toBe(true);
    expect(vertical.has('ui-sidebar-items')).toBe(true);
    expect(vertical.has('ui-drawer-body')).toBe(true);
  });
});

describe('DataTable scroll container', () => {
  const columns: DataTableColumn<{ name: string }>[] = [{ key: 'name', header: 'Name' }];
  const rows = [{ name: 'Coffee' }, { name: 'Lunch' }];

  it.each([true, false])('renders the wrapper that owns overflow-x with stacked=%s', (stacked) => {
    const { container } = render(
      <DataTable
        ariaLabel="Rows"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.name}
        stacked={stacked}
      />,
    );
    const wrap = container.firstElementChild as HTMLElement;

    expect(wrap).toHaveClass('ui-data-table-wrap');
    // The class the stylesheet makes scrollable is the class the component
    // renders, so the themed bar applies without a second hook.
    expect(scrollingClasses).toContain('ui-data-table-wrap');
  });
});
