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

The stylesheet does not ship a global reset or a font. Classes are prefixed with
`ui-` and tokens with `--ui-`, so a consumer reset (`* { margin: 0; padding: 0 }`)
does not erase component spacing. Add your own typography if needed.

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
  --ui-scrollbar-size: 6px;
  --ui-scrollbar-radius: 3px;
}
```

`--ui-scrollbar-size` and `--ui-scrollbar-radius` size every themed scrollbar in
the package; their colours follow `--ui-border` (thumb) and `--ui-text-3` (hover),
so a theme swap retints them without extra work.

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
- `Spinner`, `ProgressBar`, `ProgressStatusPanel`
- `Alert`
- `Badge`, `Chip`, `TagInput`
- `ToastProvider`, `useToast`
- `BulkActionBar`

**Forms**

- `TextInput`, `Textarea`
- `FormField`
- `Switch`
- `Slider`
- `SearchInput`
- `Checkbox`, `Radio`
- `NumberStepper`, `NumberField`
- `Dropdown`
- `Combobox`
- `Select`
- `DatePicker`
- `MonthSelector`
- `MonthCalendar`
- `ColorPicker`

**Media and content**

- `MediaThumb`
- `ResultList`, `ResultRow`
- `MetaList`

**Layout and navigation**

- `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Section`
- `Item`, `ItemGrid`, `ViewSwitcher`
- `EmptyState`
- `PageHeader`
- `ListScreen`, `ListCard`, `ListRow`, `ListSearch`, `ListEmptyState`
- `Tabs`, `SegmentedControl`
- `DropdownMenu` (also exported as `Menu`)
- `Drawer` (also exported as `Sheet`)
- `DataTable`
- `FileUpload` (also exported as `Dropzone`)
- `Sidebar`
- `AppShell`, `AppBar`

**Overlays and utilities**

- `Modal`, `ConfirmModal`, `FormModal`, `ModalFooter`
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
accepts its month list as `options`. `MonthCalendar` accepts events, a month
label, a range formatter and localized navigation labels. `DatePicker` accepts
`locale`, weekday labels and navigation labels. `ColorPicker` accepts a `labels`
object. `FileUpload` filters on `accept` (mime types, `image/*` wildcards and
`.ext` tokens) plus an optional `maxSize` in bytes, and only hands validated
files to `onFiles`; rejected files arrive in `onFilesRejected` as
`FileRejection` items with a `type`, `size` or `custom` reason and a message.
`validateFile` adds your own check, `labels` overrides the built-in messages
(`%name%` and `%max%` are interpolated) and `error` replaces the inline alert.
With `multiple` off, only the first dropped file is kept and the rest are
reported as rejected. `Sidebar` receives navigation items, an active id and
brand/footer slots, so no product branding lives in the library.

`Select` requires `ariaLabel` because the trigger shows only the current value.
`size` picks the form-field height (`md`, matching `.ui-input`) or the compact
in-table one (`sm`), and it also drives the option list width: `sm` sizes the
popup to its own content — a floor of 72px, anchored to the trigger's right edge
when the trigger is wider — so short labels such as `10 / 25 / 50 / 100` leave
no dead gutter, while `md` matches the field width; `invalid` paints the error
border and sets `aria-invalid`; `menuMaxHeight` caps the option list. The list
renders in a portal, so no ancestor `overflow: hidden` clips it.

`Card` stays a plain panel unless you ask for more: `interactive` adds the hover
lift, the press-in and a focus ring for a card that holds a control, `selected`
paints the accent ring on its own, and `loading` swaps the visible content for a
shimmer skeleton that keeps the exact height of the real content and sets
`aria-busy`, so a grid of loading cards does not jump when the data arrives.

`MediaThumb` renders a cover with an initials fallback and remembers a failed
URL per source, so a new `src` gets a fresh attempt. `initials` is the default
fallback; `fallback="none"` renders nothing when there is no usable image — no
box and no reserved aspect ratio — so an item can be text only. It is the cover
primitive only: for a cover with a title, a metadata line and a footer use
`Item` with `mediaPosition="top"`, which keeps `actions` and `footer` outside the
anchor — a `Switch` or a button inside a link swallows the navigation.
`ResultList` /
`ResultRow` are the search-result list (media, primary and secondary text, meta,
trailing action), and `MetaList` is the compact inline metadata line whose
separator is a CSS dot, never a stray text node. `NumberField` is the small
numeric input for score weights and episode counts: it keeps the typed text
locally so an empty field and a lone minus stay editable and emits the parsed,
clamped number, and it uses `type="text"` with `inputMode` because a native
number input drops the leading minus as you type.

`Item` is the card as an item: the optional media sits beside the text
(`mediaPosition="start"`) or above it (`"top"`), and `size` (`sm`, `md`, `lg`)
drives the title, the padding and the thumb — a cover above the text always
takes the poster scale. `actions` and `footer` stay outside the anchor, so a
control inside the card is always reachable, and the footer is pinned to the
bottom of a card stretched by its grid cell, so the controls of a whole row line
up whatever the titles wrap to. `interactive`, `selected` and `loading` are
forwarded straight to `Card`. `ItemGrid` lays those
items out as `grid` (equal columns that fill every cell), `list`, or `adaptive`
(any item width, from `minColumnWidth`), and takes `columns`, `gap`, a `loading`
state that renders skeleton cells and an `empty` slot for no items.
`ViewSwitcher` is the layout menu built on `SegmentedControl`; pass a
`storageKey` and it remembers the last choice in localStorage.

`AppShell` is the frame around a screen: it lays out the sidebar, a `<main>`
column and an overlay `aside` slot (chat launcher, FAB) for a whole viewport.
Below `compactBreakpoint` (640px by default) `Sidebar` turns into an off-canvas
drawer and the shell renders a compact `AppBar` at the top with the only
trigger that can reopen it — without the shell, a phone has no way back to the
navigation once the drawer closes. Pass `sidebar` as a render prop to drive the
drawer's controlled `mobileOpen` / `onMobileClose` props. The shell only owns
the frame: `children` is never wrapped in a scroller, so screens keep owning
their own scroll region.

`Sidebar` defaults to a 256px panel that collapses to an 80px rail of icons;
`width` and `collapsedWidth` override both. The collapse toggle is a 28px button
on the panel's right edge — it straddles the border, so it stays reachable in
either state — and the rail keeps the brand and the item labels mounted, moving
them out with a width/opacity transition and hiding them from the accessibility
tree, so the collapse reads as one motion instead of the text popping out. The
active item carries a 3px accent pill on the panel edge, and the whole rail
honours `prefers-reduced-motion`.

`Drawer` (also exported as `Sheet`) animates only on open: the overlay fades in
and the panel slides in from its own side, both in under 200ms. Closing stays
instant — the panel unmounts as soon as `open` becomes false — and
`prefers-reduced-motion: reduce` disables the animations. In its mobile layout
`Sidebar` follows the same rule: the backdrop fades in while the panel slides,
as one motion.

```tsx
import { useState } from 'react';
import { AppShell, Sidebar } from '@ravileal/ui';

export function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState('dashboard');

  return (
    <AppShell
      title="Dashboard"
      subtitle="October 2026"
      aside={<ChatLauncher />}
      sidebar={({ mobileOpen, onMobileClose }) => (
        <Sidebar
          items={items}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            onMobileClose();
          }}
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
          mobileOpen={mobileOpen}
          onMobileClose={onMobileClose}
          brand={{ title: 'Budget' }}
        />
      )}
    >
      <DashboardScreen />
    </AppShell>
  );
}
```

`MonthCalendar` also ships the pure date helpers it uses (`buildMonthGrid`,
`monthGridLabel`, `nextRangeSelection`, `eventColor`, `parseISODate`, `toISO`,
`isWithinRange`) for consumers that need the same grid math outside React.
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
