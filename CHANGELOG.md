## [1.7.0](https://github.com/ravileal/ui/compare/release-1.6.5...release-1.7.0) (2026-11-07)

### Features

* **build:** ship per-component entry points ([59046b3](https://github.com/ravileal/ui/commit/59046b3cf866dc23608626555829539fda80e294))
* **build:** split the stylesheet into tokens and per-component files ([e2f7abf](https://github.com/ravileal/ui/commit/e2f7abfe79282f1179424a83dcd429c81cf404ab))

## [1.6.5](https://github.com/ravileal/ui/compare/release-1.6.4...release-1.6.5) (2026-11-05)

### Bug Fixes

* **ui:** spread a two-item app header and right-align stacked card values ([87e1e9c](https://github.com/ravileal/ui/commit/87e1e9c9a9936e79b38ba12fd662ce035c5f3586))

## [1.6.4](https://github.com/ravileal/ui/compare/release-1.6.3...release-1.6.4) (2026-11-05)

### Bug Fixes

* **app-header:** keep the section switcher on the bar ([ec75667](https://github.com/ravileal/ui/commit/ec756673ce3e1bb1734b09fffaa3ab5523306cf5))
* **badge:** centre the tag's own text ([5ddd59a](https://github.com/ravileal/ui/commit/5ddd59ab0191c8229207f22097356b85178470c8))
* **datatable:** one alignment inside a stacked card ([50db2fe](https://github.com/ravileal/ui/commit/50db2fe22ab5865f300744d16c34361f25bf2d14))
* **ui:** align the mobile card layout ([e841d10](https://github.com/ravileal/ui/commit/e841d10dabc1d61f354141a0c15f2b78b7eb1e72))

## [1.6.3](https://github.com/ravileal/ui/compare/release-1.6.2...release-1.6.3) (2026-11-01)

### Bug Fixes

* **number-stepper:** let the field take a typed negative ([9f31ead](https://github.com/ravileal/ui/commit/9f31eadb8b007df0e4c07b56265bf783d44357f2))

## [1.6.2](https://github.com/ravileal/ui/compare/release-1.6.1...release-1.6.2) (2026-11-01)

### Bug Fixes

* keep a pressed glass control in the accent colour ([b6baa80](https://github.com/ravileal/ui/commit/b6baa80a9c6a0c54e70d5a7a6f0859a60259e14b))

## [1.6.1](https://github.com/ravileal/ui/compare/release-1.6.0...release-1.6.1) (2026-11-01)

### Bug Fixes

* **item:** reserve two title lines so poster meta lines align ([8fe1cb6](https://github.com/ravileal/ui/commit/8fe1cb6b0bc0855dd81470912efb77e9aee21a9d))

## [1.6.0](https://github.com/ravileal/ui/compare/release-1.5.0...release-1.6.0) (2026-11-01)

### Features

* ship the gallery glyphs, the dot separators and the roomier nav ([aa1872a](https://github.com/ravileal/ui/commit/aa1872a9e8132b815cee860b255915ca58d8f253))

## [1.5.0](https://github.com/ravileal/ui/compare/release-1.4.0...release-1.5.0) (2026-11-01)

### Features

* align the gallery card, header and toolbar with the reference ([9fa8f65](https://github.com/ravileal/ui/commit/9fa8f65a55b2ac794d2080180260123523f46823))

## [1.4.0](https://github.com/ravileal/ui/compare/release-1.3.0...release-1.4.0) (2026-11-01)

### Features

* **grid:** give the default grid a responsive column ladder ([113140a](https://github.com/ravileal/ui/commit/113140ab162f3bfcbb6f393e8d7b5bb1f24a5b3f))

## [1.3.0](https://github.com/ravileal/ui/compare/release-1.2.0...release-1.3.0) (2026-11-01)

### Features

* add the gallery home screen shapes ([d6bff10](https://github.com/ravileal/ui/commit/d6bff10f8c687783b6bc4cd321026514087cfb0e))

## [1.2.0](https://github.com/ravileal/ui/compare/release-1.1.1...release-1.2.0) (2026-11-01)

### Features

* **item-grid:** pack adaptive blocks by their own size ([1fe7043](https://github.com/ravileal/ui/commit/1fe7043971a8422202db016070ba3abf80a3b74e))

## [1.1.1](https://github.com/ravileal/ui/compare/release-1.1.0...release-1.1.1) (2026-11-01)

### Bug Fixes

* **sidebar:** let the item list shrink so the footer stays in the panel ([c994dd3](https://github.com/ravileal/ui/commit/c994dd3fb21697ee416cb4cd651a122b7a2c886f))

## [1.1.0](https://github.com/ravileal/ui/compare/release-1.0.2...release-1.1.0) (2026-11-01)

### Features

* **sidebar:** float the collapse toggle and animate the label collapse ([249bd76](https://github.com/ravileal/ui/commit/249bd76083772ec63e2a8263f250ed47f9f340e0))

## [1.0.2](https://github.com/ravileal/ui/compare/release-1.0.1...release-1.0.2) (2026-11-01)

### Bug Fixes

* **item:** stack the item inside the card content wrapper ([39989fa](https://github.com/ravileal/ui/commit/39989faeb19d2095cdab0ee108811fbae6dfff0d))

## [1.0.1](https://github.com/ravileal/ui/compare/release-1.0.0...release-1.0.1) (2026-11-01)

### Bug Fixes

* **item:** poster scale for a top cover and a footer pinned to the card bottom ([074f2c2](https://github.com/ravileal/ui/commit/074f2c20e1f769b1f98a7ca1311a185b054e692e))

## [1.0.0](https://github.com/ravileal/ui/compare/release-0.5.0...release-1.0.0) (2026-11-01)

### ⚠ BREAKING CHANGES

* MediaCard and its types are no longer exported. Use Item with
mediaPosition="top", the media prop for the cover and initials, footer for the
controls and renderLink instead of renderTitleLink.

### Features

* drop MediaCard in favour of Item with a top cover ([94a0b49](https://github.com/ravileal/ui/commit/94a0b4956f5a51fa364eb7717a9ac8d0e411c14a))

## [0.5.0](https://github.com/ravileal/ui/compare/release-0.4.0...release-0.5.0) (2026-10-31)

### Features

* **card:** add interactive, selected and loading states ([ca12551](https://github.com/ravileal/ui/commit/ca1255168e1b42003fa06b12fd36d2528aa830e1))
* **item-grid:** add the grid, list and adaptive item layouts with a view switcher ([1360224](https://github.com/ravileal/ui/commit/13602246856892749384a0aacce6d49ed3f58043))
* **item:** add the card-as-item component and the none fallback for thumbs ([c3ed97f](https://github.com/ravileal/ui/commit/c3ed97f635aab48e9260f433a18ce1fd22721174))
* **kit:** export the item, item grid and view switcher and document them ([486c8be](https://github.com/ravileal/ui/commit/486c8beb68e9820b47e625bd3c3e46b9212f178c))
* **media-card:** build the media card on the card base with its states ([53256f2](https://github.com/ravileal/ui/commit/53256f2ec044775f6420634c45f33d9effe97697))

## [0.4.0](https://github.com/ravileal/ui/compare/release-0.3.0...release-0.4.0) (2026-10-31)

### Features

* **select:** token-themed accessible Select for the kit ([36dc6f5](https://github.com/ravileal/ui/commit/36dc6f55d4d410a36e6db67646221e03b0591ee3))

### Bug Fixes

* **data-table:** use kit Select and Checkbox in pagination and column menu ([ca2290f](https://github.com/ravileal/ui/commit/ca2290f7388f04dc6bd7c16a4a044fd8081e2ad4))
* **select:** size the compact option list to its content ([23674f1](https://github.com/ravileal/ui/commit/23674f11c567a6d4c3a00171315e12cb00efb391))

## [0.3.0](https://github.com/ravileal/ui/compare/release-0.2.0...release-0.3.0) (2026-10-31)

### Features

* **data-table:** resizable columns, column menu and pagination ([189817c](https://github.com/ravileal/ui/commit/189817cbad204d259d682f68db60504be53c5c58))

## [0.2.0](https://github.com/ravileal/ui/compare/release-0.1.0...release-0.2.0) (2026-10-31)

### Features

* add sidebar, calendar, form modal and selection primitives ([8e81c4e](https://github.com/ravileal/ui/commit/8e81c4ef611b032da418c8f576b272eded7872c8))
* add split button component ([07496b0](https://github.com/ravileal/ui/commit/07496b02ed806a207de6e9ec71eca7b1d156e611))
* **app-shell:** add mobile-aware application shell layout ([01e5502](https://github.com/ravileal/ui/commit/01e5502551d1f57309f64c17c4f0062a80a95d20))
* **components:** add stacked card mode to DataTable and class hooks to ListScreen ([905bd19](https://github.com/ravileal/ui/commit/905bd19e1616f59fbd7928fe8fcbc77904aa263d))
* **drawer:** animate the drawer and sidebar backdrop entrance ([5216c1a](https://github.com/ravileal/ui/commit/5216c1a7ff1b0b7d25fbd1ce92b822a186721086))
* **media:** add MediaCard, MediaThumb, ResultList, MetaList and NumberField ([21d442c](https://github.com/ravileal/ui/commit/21d442c8217c9fb6524f6bacffefebd94936ae0e))
* **month-calendar:** preview the pending range on hover ([e772286](https://github.com/ravileal/ui/commit/e772286fe50853b41e8cbd4280366a2172b7d04c))
* **sidebar:** add mobile overlay drawer mode ([b629539](https://github.com/ravileal/ui/commit/b629539085aad80a43602634739e269428998ff8))
* **split-button:** weld the caret menu to the button ([b6e6e99](https://github.com/ravileal/ui/commit/b6e6e99ea681c2328d0b04674f0c3176283fd50d))
* **styles:** add compact viewport layer for mobile layouts ([357b227](https://github.com/ravileal/ui/commit/357b2274117085eaf67c47c5f0272ca965a1e205))
* **upload:** filter by mime type and size with validation feedback ([dfab27e](https://github.com/ravileal/ui/commit/dfab27eba98905736ddc94bdc88067e996f6ed1b))
* **upload:** ship validation styles, type exports and docs ([a7c84d9](https://github.com/ravileal/ui/commit/a7c84d9ad37a1c1ad8b059641ee5c09b7ab733c4))

### Bug Fixes

* **color-picker:** keep the panel inside its own width ([bb2300e](https://github.com/ravileal/ui/commit/bb2300e2497e7db394ec4522d60099976fdbf610))
* **data-table:** drop the neutral sort glyph from unsorted headers ([e747e65](https://github.com/ravileal/ui/commit/e747e652076cda1c22a76dda4501b13f09ef1690))
* keep component spacing under consumer resets ([3f59f03](https://github.com/ravileal/ui/commit/3f59f035e11dcadb2a085e5e7e4a6a604a7b64b9))
* refine split menu item styling ([1cbfadb](https://github.com/ravileal/ui/commit/1cbfadbc8b9f0dcd4d6c913cb5143a6dedb82389))
* **regex-field:** keep the sample tester inside the card padding ([bc15620](https://github.com/ravileal/ui/commit/bc156200bea2b42730d7f360a0cc14a4c2607e64))
* satisfy lint in the menu trigger ([b2a3622](https://github.com/ravileal/ui/commit/b2a3622d3a3a7f86be8faa4ce4e3c753d8865515))
* **sidebar:** let the uncontrolled mobile drawer close itself ([ad34aff](https://github.com/ravileal/ui/commit/ad34aff40e7137a4eb68aacb0fcb46328e2ab62e))
* **split-button:** round the open menu on the left and flatten the weld ([c1a0488](https://github.com/ravileal/ui/commit/c1a0488561f32384bf14d0873c9c38ce4739ab0f))
* **stories:** use the library TextInput in the InlineEditorCard story ([5b91007](https://github.com/ravileal/ui/commit/5b9100700683e32967cf2ff40e6f94bcb8365590))
* style split menu items like the trigger button ([e23f307](https://github.com/ravileal/ui/commit/e23f3072b91f858af2d1a2bb250f37b30f31784e))
* **styles:** declare box-sizing on boxed primitives ([02ce2f4](https://github.com/ravileal/ui/commit/02ce2f4c828455473cf7093c12b1caa239a583f3))
* **styles:** restore the title-to-subtitle gap ListScreen lost when it moved to classes ([f94aeaa](https://github.com/ravileal/ui/commit/f94aeaaef8240229211b16f21d513413ef21d27d))

## [0.2.0](https://github.com/ravileal/ui/compare/release-0.1.0...release-0.2.0) (2026-10-31)

### Features

* add sidebar, calendar, form modal and selection primitives ([8e81c4e](https://github.com/ravileal/ui/commit/8e81c4ef611b032da418c8f576b272eded7872c8))
* add split button component ([07496b0](https://github.com/ravileal/ui/commit/07496b02ed806a207de6e9ec71eca7b1d156e611))
* **app-shell:** add mobile-aware application shell layout ([01e5502](https://github.com/ravileal/ui/commit/01e5502551d1f57309f64c17c4f0062a80a95d20))
* **components:** add stacked card mode to DataTable and class hooks to ListScreen ([905bd19](https://github.com/ravileal/ui/commit/905bd19e1616f59fbd7928fe8fcbc77904aa263d))
* **drawer:** animate the drawer and sidebar backdrop entrance ([5216c1a](https://github.com/ravileal/ui/commit/5216c1a7ff1b0b7d25fbd1ce92b822a186721086))
* **media:** add MediaCard, MediaThumb, ResultList, MetaList and NumberField ([21d442c](https://github.com/ravileal/ui/commit/21d442c8217c9fb6524f6bacffefebd94936ae0e))
* **month-calendar:** preview the pending range on hover ([e772286](https://github.com/ravileal/ui/commit/e772286fe50853b41e8cbd4280366a2172b7d04c))
* **sidebar:** add mobile overlay drawer mode ([b629539](https://github.com/ravileal/ui/commit/b629539085aad80a43602634739e269428998ff8))
* **split-button:** weld the caret menu to the button ([b6e6e99](https://github.com/ravileal/ui/commit/b6e6e99ea681c2328d0b04674f0c3176283fd50d))
* **styles:** add compact viewport layer for mobile layouts ([357b227](https://github.com/ravileal/ui/commit/357b2274117085eaf67c47c5f0272ca965a1e205))
* **upload:** filter by mime type and size with validation feedback ([dfab27e](https://github.com/ravileal/ui/commit/dfab27eba98905736ddc94bdc88067e996f6ed1b))
* **upload:** ship validation styles, type exports and docs ([a7c84d9](https://github.com/ravileal/ui/commit/a7c84d9ad37a1c1ad8b059641ee5c09b7ab733c4))

### Bug Fixes

* **color-picker:** keep the panel inside its own width ([bb2300e](https://github.com/ravileal/ui/commit/bb2300e2497e7db394ec4522d60099976fdbf610))
* **data-table:** drop the neutral sort glyph from unsorted headers ([e747e65](https://github.com/ravileal/ui/commit/e747e652076cda1c22a76dda4501b13f09ef1690))
* keep component spacing under consumer resets ([3f59f03](https://github.com/ravileal/ui/commit/3f59f035e11dcadb2a085e5e7e4a6a604a7b64b9))
* refine split menu item styling ([1cbfadb](https://github.com/ravileal/ui/commit/1cbfadbc8b9f0dcd4d6c913cb5143a6dedb82389))
* **regex-field:** keep the sample tester inside the card padding ([bc15620](https://github.com/ravileal/ui/commit/bc156200bea2b42730d7f360a0cc14a4c2607e64))
* satisfy lint in the menu trigger ([b2a3622](https://github.com/ravileal/ui/commit/b2a3622d3a3a7f86be8faa4ce4e3c753d8865515))
* **sidebar:** let the uncontrolled mobile drawer close itself ([ad34aff](https://github.com/ravileal/ui/commit/ad34aff40e7137a4eb68aacb0fcb46328e2ab62e))
* **split-button:** round the open menu on the left and flatten the weld ([c1a0488](https://github.com/ravileal/ui/commit/c1a0488561f32384bf14d0873c9c38ce4739ab0f))
* **stories:** use the library TextInput in the InlineEditorCard story ([5b91007](https://github.com/ravileal/ui/commit/5b9100700683e32967cf2ff40e6f94bcb8365590))
* style split menu items like the trigger button ([e23f307](https://github.com/ravileal/ui/commit/e23f3072b91f858af2d1a2bb250f37b30f31784e))
* **styles:** declare box-sizing on boxed primitives ([02ce2f4](https://github.com/ravileal/ui/commit/02ce2f4c828455473cf7093c12b1caa239a583f3))
* **styles:** restore the title-to-subtitle gap ListScreen lost when it moved to classes ([f94aeaa](https://github.com/ravileal/ui/commit/f94aeaaef8240229211b16f21d513413ef21d27d))
