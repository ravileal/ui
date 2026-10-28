# @ravileal/ui

Reusable React UI primitives with a themeable CSS-variable design system.

- Repository: https://github.com/ravileal/ui
- Storybook: https://ravileal.github.io/ui/

The library is intentionally small and domain-agnostic. It contains the
presentational primitives used by `couple-finance` and other personal React
projects. Finance-specific screens and components stay in their application.

## Install

```bash
pnpm add @ravileal/ui
# or
npm install @ravileal/ui
```

React and React DOM are peer dependencies:

```bash
pnpm add react react-dom
```

## Styles

Import the stylesheet once in your application entry point (or in the root
layout for Next.js):

```ts
import '@ravileal/ui/styles.css';
```

The stylesheet is wrapped in `@layer ravileal-ui` and does not ship a global
reset or a font. Add your own reset/typography if needed.

## Theme

All tokens are namespaced with `--ui-*` to avoid collisions:

```css
:root {
  --ui-bg: #0b1422;
  --ui-surface: #101c2e;
  --ui-surface-2: #17273a;
  --ui-border: #24384f;
  --ui-text: #eaf0f8;
  --ui-text-2: #9fb4cd;
  --ui-text-3: #7b93b0;
  --ui-accent: #00c9a7;
  --ui-blue: #4f7cff;
  --ui-green: #22c55e;
  --ui-red: #f87171;
  --ui-amber: #f59e0b;
  --ui-purple: #a855f7;
  --ui-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  --ui-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --ui-overlay: rgba(0, 0, 0, 0.6);
  --ui-on-accent: #ffffff;
}
```

Override any token on `:root`, a container, or a theme selector. The library
ships light defaults under `[data-ui-theme='light']` and `.ui-theme-light`:

```tsx
<html data-ui-theme="light">
```

## Usage

```tsx
import { useState } from 'react';
import { Dropdown, Modal } from '@ravileal/ui';
import '@ravileal/ui/styles.css';

export function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('food');

  return (
    <>
      <Dropdown
        ariaLabel="Category"
        value={value}
        onChange={setValue}
        options={[
          { value: 'food', label: 'Food', color: '#00c9a7' },
          { value: 'home', label: 'Home', color: '#4f7cff' },
        ]}
      />
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal open={open} title="Settings" onClose={() => setOpen(false)}>
        Content
      </Modal>
    </>
  );
}
```

## Components

**Actions and feedback**

- `Button`, `IconButton`
- `Spinner`, `ProgressBar`
- `Alert`
- `Badge`, `Chip`
- `ToastProvider`, `useToast`

**Forms**

- `TextInput`, `Textarea`
- `FormField`
- `Switch`
- `Slider`
- `SearchInput`
- `Checkbox`, `Radio`
- `NumberStepper`
- `Dropdown`
- `Combobox`
- `DatePicker`
- `MonthSelector`
- `ColorPicker`

**Layout and navigation**

- `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Section`
- `EmptyState`
- `PageHeader`
- `ListScreen`, `ListCard`, `ListRow`, `ListSearch`, `ListEmptyState`
- `Tabs`, `SegmentedControl`
- `DropdownMenu` (also exported as `Menu`)
- `Drawer` (also exported as `Sheet`)
- `DataTable`
- `FileUpload` (also exported as `Dropzone`)

**Overlays and utilities**

- `Modal`, `ConfirmModal`
- `Tooltip`
- `Avatar`
- `CopyValue`
- `InlineEditorCard`
- `RowActions`
- `Skeleton`, `SkeletonStatus`, `PageSkeleton`, `PageHeaderSkeleton`, `SearchSkeleton`, `ListCardSkeleton`, `DetailRowsSkeleton`
- `Portal`
- `VisuallyHidden`

Every component exports its prop types. `CopyValue` accepts `formatValue` and
`copyValue` so the consumer owns currency/locale formatting. `MonthSelector`
accepts its month list as `options`. `DatePicker` accepts `locale`, weekday
labels and navigation labels. `ColorPicker` accepts a `labels` object.
`Button` accepts `variant` (`primary`, `secondary`, `ghost`, `danger`), `size`
and `loading`.

```tsx
import { useState } from 'react';
import { Button, FormField, Switch, TextInput, ToastProvider, useToast } from '@ravileal/ui';

function SettingsForm() {
  const [checked, setChecked] = useState(true);
  const { showToast } = useToast();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FormField label="Partner name" hint="Shown in reports" required>
        <TextInput />
      </FormField>
      <Switch checked={checked} onChange={setChecked} label="Monthly summary" />
      <Button onClick={() => showToast({ title: 'Saved', tone: 'success' })}>Save</Button>
    </div>
  );
}

export function Settings() {
  return (
    <ToastProvider>
      <SettingsForm />
    </ToastProvider>
  );
}
```

## Next.js

The package entry is a client boundary (`"use client"`). Import the stylesheet
in the root layout:

```tsx
// app/layout.tsx
import '@ravileal/ui/styles.css';
```

The components render safely with `ReactDOMServer`; browser-only features
(portals, eyedropper, clipboard) are initialized after mount or inside event
handlers.

## Local development with `couple-finance`

In this repository:

```bash
pnpm build
pnpm link --global
```

In the consuming project:

```bash
pnpm link --global @ravileal/ui
```

Remove the link before committing and use the published semver range. Keep
React as a peer dependency to avoid duplicate React copies.

## Release

Releases use semantic-release based on
[`ravileal/semantic-release`](https://github.com/ravileal/semantic-release).
The release workflow is initially manual (`workflow_dispatch`) so it cannot fail
before the npm automation token exists. Add the `NPM_TOKEN` repository secret,
publish the first `0.1.0` and tag `release-0.1.0`, then enable the `push` trigger
on `main` in `.github/workflows/release.yml`.

The semantic-release config uses the `release-${version}` tag format in
production, matching the reference template.

## Development

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm storybook
pnpm build-storybook
```
