# Portfolio v3 — Home cursor build

Based on portfolio-v2 commit `a2cf935d0f3a7774ff649e72d7b98e581a9d0831`.
Development branch: `codex/portfolio-v3-home-build`.
Production project: `portfolio-v2` in the Sunday Vercel team, serving `sunday19x3.xyz`.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3003
```

Open http://127.0.0.1:3003/. The separate cursor playground uses port 4173.

## Playback

- Only Home uses the builder. Detail routes retain the original experience.
- Desktop requires width ≥1024px, hover support, a fine pointer and no reduced-motion preference. Mobile keeps the original layout and interactions.
- Loading Home at the top starts Navigation and Hero together. Each lower section starts on its first visible pixel, including during continuous scrolling. There is no visibility percentage, viewport inset or debounce.
- Each section plays once per document load. Reload starts a fresh pass; client-side returns from detail pages keep the completed state. Hash entries skip the intro while retaining lower-section playback.
- A started scene runs to its finite timeline's natural completion. Hover, click, focus, Tab/Escape, scrolling and hiding the tab do not skip it. Navigation remains usable.
- Cleanup restores content on unmount, desktop eligibility loss, reduced motion or initialization errors. There is no wall-clock watchdog or preview control bar.
- Sticky statements start individually when their own opacity first becomes positive, observed at React's style commit.

## Scene behavior

Cursors are allocated to actual operations rather than multiplied by a fixed factor. Navigation's Work, Stack and Contact links have three simultaneous writers. Both adjacent gaps begin at 16px and are adjusted together by separate spacing workers. Hero metadata and introduction lines are independent jobs. Text is entered by one cursor per draft line, following the caret; a separate cursor applies final typography after those lines finish. Short labels remain a single line.

Project metadata fields, title, description lines, individual tags and external URL run independently. One image worker submits the whole-image reveal and leaves; the tile animation completes automatically. Stack keywords are styled in parallel. Contribution columns, signal bars, ticker indicators and score values each have their own worker. Social columns retain the duplication gesture; after both copies land, their names and URLs are edited concurrently.

Workers appear only during their assigned operation and leave on completion. There are no follower cursors, inspection passes or filler loops. New worker DOM belongs to the scene cleanup, names are unique among allocated workers, and all tasks share the existing 0.75× timeline speed.

Content is built in place: create a region, draw a box, type text or reveal the existing image through generation tiles. Image generation is an animation using existing portfolio assets, not an external generation request.

New text starts in regular system sans at 16px. A cursor clicks the text to apply final typography; accent, italic, underline and tag styling have explicit clicks where applicable. Contact first builds GitHub, then two cursors drag its copies into the other columns. Both land before their labels and URLs become Twitter and LinkedIn. Replacement text inherits GitHub typography immediately.

Layout gestures demonstrate gap, margin and padding in the reserved final footprint. Orange rulers appear at the top/left only during spacing work. There are no row/column, align or justify changes. Every target retains its full storyboard even if it begins below the viewport.

Each overlay uses a separate canvas that follows its real section anchor. Navigation stays fixed; Hero scrolls normally; sticky paint follows source translation and opacity. Offscreen scenes continue with their paint hidden. Rulers remain fixed to viewport edges. Home's temporary `data-build-hover-lock` flag prevents magnetic movement, hover-flip and tooltip paint from taking over during construction; detail routes never set this flag.

Live ticker and contribution data still fetch normally. A scene freezes its rendered snapshot during construction and publishes incoming data after completion. Mobile retains the original ticker and counters.

## Validation

The implementation passed scoped ESLint, TypeScript, a production build and whitespace checks. Browser verification covered:

- Initial load/reload, all Home scene types and one-shot playback.
- First-pixel entry: outside by 6px remains waiting; about 2px visible starts playback, including Now, Work, projects, Contact and Footer.
- Continuous scroll, header click, keyboard interaction and offscreen completion without cancellation.
- Sticky statements starting at their first positive opacity while transparent statements remain waiting.
- Cursor/frame alignment after scrolling, rulers pinned to viewport edges, complete social cloning, and cleanup without leftover owners/drafts/clones.
- Desktop geometry matching the original baseline, mobile 390×844 matching within 0.001px with no overlays, and detail routes without builder DOM.

Local contributions use the existing fallback when `GITHUB_TOKEN` is unavailable. Populated live heatmap behavior is validated against the deployed environment when available. Reduced-motion guards are implemented in lifecycle and CSS; no separate browser media emulation or measured 60fps claim is made.
