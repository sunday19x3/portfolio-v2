# Session log

## 2026-04-28 — Page transition FOUC fix + project detail pages

### Changed
- `src/components/TransitionProvider.tsx` — fixed initial-paint flash where the persimmon stripe overlay covered the page on first load. Added `style={{ visibility: "hidden", opacity: 0 }}` to the stripes wrapper and unhide via `gsap.set(autoAlpha: 1)` inside `useGSAP`. Earlier attempt with inline `transform: translateY(100%)` on the stripes themselves caused GSAP to stack two transforms (yPercent + the inline one), breaking the cover animation — the wrapper-visibility approach avoids that.
- `src/components/portfolio/HanoiClock.tsx` (new) — extracted the live Hanoi clock from `app/page.tsx` so project detail pages can reuse it. Project pages had hardcoded `VN · GMT+7 · Available Q2 ’26`; moved them toward the home pattern (`Hanoi · 14:32`).
- `src/app/page.tsx` — removed local `HanoiClock` definition, imported from shared location.
- `src/app/mimboku/page.tsx`, `src/app/oh-kids/page.tsx` — imported `HanoiClock`. Note: the user reverted the actual `nav__loc` text change on mimboku, so the loc string in those files may still read `VN · GMT+7 · Available Q2 ’26` — leave alone unless they ask.
- `src/app/punkga/page.tsx` (new) — case-study page mirroring the Mimboku layout. Content is research-grounded from punkga.me, Aura Network insights, and DoraHacks. Stack trimmed to **Next.js, Tailwind, Story Protocol** at user request. Banner pulled from punkga.me's og:image.
- `src/app/pyxis/page.tsx` (new) — case study for Pyxis Safe (Cosmos multisig, Aura Network). Content sourced from `aura-nw/Aura-Safe` GitHub and Aura Insights blog. Banner pulled from Aura Insights "DApp 101" post.
- `src/app/dichung/page.tsx` (new) — case study for Dichung (VN ride-share). Content anchored on dichung.vn keywords (`xe sân bay`, `đi chung xe`, `vận chuyển hàng hóa`, `thuê xe tự lái`, `du lịch trọn gói`). Banner is dichung.vn's og:image.
- `public/projects/punkga-banner.png`, `pyxis-banner.png`, `dichung-banner.png` (new) — case-study cover images downloaded from each project's official og:image / blog hero.

### Why
Building out the work section of the portfolio. Each project tile on the home page now has a corresponding detail page following the Mimboku template (DNav · DHero · DCover · DProblem · DOutcome · DProcess · DStack · DCoda · DNext · DFooter).

### Open items
- Process steps and outcome metrics on the new detail pages are educated guesses based on public info — user asked to fill from research and flag gaps. They've been flagged in chat; user may want to rewrite the personal-contribution copy.
- Mimboku/oh-kids `nav__loc` may still show `VN · GMT+7 · Available Q2 ’26` (user reverted that edit). Leave unless asked.
- Punkga page hero title was edited by user from `PUNKGA.` to `PUNKGA.ME` — do not revert.
