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

---

## 2026-04-28 (later) — audit fixes + per-page metadata + favicon

Code reviewer pass landed seven BLOCKING/HIGH and three MEDIUM items; all addressed in this pass.

### Changed
- `src/components/TransitionProvider.tsx` — added `gsap.killTweensOf(stripes)` and `gsap.killTweensOf(chars)` at the top of the reveal `useEffect` so rapid navigation / browser-back doesn't leave two timelines running on the same DOM nodes (would otherwise leave the stripe overlay half-visible permanently).
- `src/components/TransitionLink.tsx` — bail out for external (`http(s)://` or `//`) hrefs before `preventDefault` + `navigate`. Previously, clicking an external link on the home page (e.g. `mimboku.com`) called `router.push('https://...')` which started the cover animation but never resolved. Also removed two debug `console.log("[TL] ...")` calls.
- `src/app/api/latest-commit/route.ts` — replaced N+1 fan-out (list 10 repos, then fetch 10 commit endpoints in parallel) with a single `GET /search/commits?q=author:<user>&sort=author-date` call. Avoids GitHub's secondary rate limit.
- `src/app/api/contributions/route.ts` — early-return 501 if `GITHUB_TOKEN` is missing (GraphQL endpoint requires auth; previously it tried unauth'd and returned 502 forever).
- `src/app/oh-kids/view.tsx` — gallery commented out (matches all other detail pages); crumb changed `№ 01 · OH KIDS` → `DRAFT · OH KIDS` (was colliding with Mimboku); DNext fixed to point at `/` with label "All work" (was linking to `/#work` with the text "Bilingual Wellness", a project that doesn't exist).
- `src/app/{mimboku,punkga,pyxis,dichung,oh-kids}/view.tsx` (all) — `addEventListener`/`removeEventListener` in `PageRail` now prefixed with `window.` to match `hooks.ts` convention and survive SSR-ish test envs.

### Per-page metadata (audit MEDIUM #10)
- `src/app/{mimboku,punkga,pyxis,dichung,oh-kids}/page.tsx` — replaced each `"use client"` page with a server-component wrapper that exports `metadata` and renders `./view`. The original client body now lives in `view.tsx` in each route folder. Each has page-specific title/description and `openGraph`/`twitter` images pointing at the project banner. Oh Kids carries `robots: { index: false, follow: false }` since the page is marked DRAFT.
- Verified via SSR: `/mimboku` → `Mimboku — № 01 · Sunday`, `/punkga` → `Punkga.me — № 02 · Sunday`, etc.

### New favicon
- `src/app/icon.svg` (new) — circle favicon, warm paper (`#F2EFE8`) background, persimmon (`#D94B1F`) logo centered. App Router auto-injects `<link rel="icon" href="/icon.svg">` alongside the existing `favicon.ico` fallback.

### Trade-offs / decisions
- Chose `view.tsx` (not `Page.tsx`) as the client filename to avoid case-insensitive FS collisions with `page.tsx` on macOS.
- Kept Oh Kids as DRAFT rather than renumber it — it isn't on the home tile list, so we don't know what № to assign.
- Did not re-issue the existing `favicon.ico` (would need a binary toolchain). The SVG takes precedence in modern browsers; the legacy `.ico` remains as fallback.

### Audit follow-ups still open
None from the audit. Earlier open items (real metrics + role narratives on detail pages) remain.

---

## 2026-04-28 (deploy + analytics) — production cutover

### Vercel project + domains (operational, not in repo)
- New Vercel project `portfolio-v2` (`prj_Sl2j4iXFNh4EWQqoSzFZXbvoi4X7`) created via API, linked to GitHub repo `sunday19x3/portfolio-v2`. First production deploy on commit `0ae6120` went READY.
- Domain swap on Vercel:
  - Removed `sunday19x3.xyz` from old `portfolio` project.
  - Attached `legacy.sunday19x3.xyz` to old `portfolio` project (verified=true, DNS auto-resolved on Vercel DNS).
  - Attached `sunday19x3.xyz` to new `portfolio-v2` project.
- Verified: `sunday19x3.xyz` serves new portfolio (`<title>Sunday — Frontend & Web3 developer</title>`); `legacy.sunday19x3.xyz` serves old portfolio (`<title>Hoang Son Pham - Front-end Developer</title>`).
- Future pushes to `main` auto-deploy via GitHub integration.

### Env vars status
- New project has **no env vars set yet**.
- `/api/contributions` returns 501 in production (needs `GITHUB_TOKEN`).
- `/api/deployments` returns empty array (needs `VERCEL_TOKEN`, `VERCEL_TEAM_ID`).
- `/api/latest-commit` works unauth'd against `/search/commits` — but adding `GITHUB_TOKEN` is recommended for higher rate limit.
- User to provide tokens; `VERCEL_TEAM_ID = team_ZtHNFUxCNfjILXI1kY02dh3z` is non-secret and ready to set.

### Changed in this commit
- `src/app/layout.tsx` — added `@vercel/analytics/next` `<Analytics />` and `@vercel/speed-insights/next` `<SpeedInsights />` mounted alongside `TransitionProvider` in `<body>`.
- `package.json` / `pnpm-lock.yaml` — `@vercel/analytics` and `@vercel/speed-insights` added.
- Verified via `pnpm build`: typecheck clean, all 14 routes still prerender as expected.

### Why
- Site is live on Vercel; analytics + speed insights start collecting data on next deploy with zero further config.
