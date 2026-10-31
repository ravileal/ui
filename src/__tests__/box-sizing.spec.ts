import { describe, expect, it } from 'vitest';
// Node built-ins are available at test time but are not part of this project's
// ambient types, which only pull in vitest and jest-dom.
// @ts-expect-error -- node:fs has no ambient types in this tsconfig
import { readFileSync } from 'node:fs';

const stylesheet = readFileSync('src/styles.css', 'utf8');

interface Rule {
  selectors: string[];
  body: string;
}

const withoutComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Collects every declaration block, including the ones nested in at-rules such
 * as `@media`. Nested blocks are flattened, which is enough to answer "does
 * this class declare box-sizing in its own rule".
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

const boxedPrimitives = [
  'ui-card',
  'ui-input-wrap',
  'ui-input',
  'ui-textarea',
  'ui-select',
  'ui-modal',
  'ui-modal-body',
  'ui-table-wrap',
  'ui-tag',
  'ui-dropdown-menu',
  'ui-toast',
  'ui-alert',
  'ui-badge',
];

const classPattern = (className: string) => new RegExp(`\\.${className}(?![\\w-])`);
const borderBoxPattern = /(?:^|;)\s*box-sizing\s*:\s*border-box\s*(?:;|$)/;

describe('styles.css box sizing', () => {
  it('does not rely on a global universal reset', () => {
    expect(withoutComments(stylesheet)).not.toMatch(/(?:^|\})\s*\*\s*\{/);
  });

  it.each(boxedPrimitives)('%s owns a border-box declaration', (className) => {
    const matcher = classPattern(className);
    const matchingRules = rules.filter((rule) => rule.selectors.some((selector) => matcher.test(selector)));

    expect(matchingRules.length, `no rule block targets .${className}`).toBeGreaterThan(0);
    expect(
      matchingRules.some((rule) => borderBoxPattern.test(rule.body)),
      `.${className} must declare box-sizing: border-box in its own rule block`,
    ).toBe(true);
  });

  it('declares border-box rather than content-box', () => {
    const declarations = [...withoutComments(stylesheet).matchAll(/box-sizing\s*:\s*([^;}]+)/g)].map(
      (match) => match[1].trim(),
    );

    expect(declarations.length).toBeGreaterThan(0);
    expect(declarations.every((value) => value === 'border-box')).toBe(true);
  });
});
