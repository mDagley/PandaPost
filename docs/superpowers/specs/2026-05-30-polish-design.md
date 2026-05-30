# PandaPost Polish — Design Spec
**Date:** 2026-05-30  
**Status:** Approved

---

## Overview

A holistic polish pass on PandaPost that tightens consistency, adds missing pieces, and deepens the panda/bamboo theming — while preserving the existing pink/lavender color palette, rotated frame overlays, and anime/dreamy aesthetic.

---

## 1. Structure & Components

### Files changed
- **`src/App.js`** — add `FeaturedArticle` component, `SkeletonCard` component, `Footer` component; add `source` field to every normalized article; wire featured article slot above grid
- **`src/App.css`** — featured card styles, bamboo masthead pattern, skeleton shimmer, footer, source badge styles, card hierarchy fixes, double-spacing fix

### New components (all in `App.js`)
| Component | Purpose |
|---|---|
| `FeaturedArticle` | Renders the first article full-width above the grid on page 1 |
| `SkeletonCard` | Shimmer placeholder shown while articles are loading |
| `Footer` | Static branded footer below pagination |

### Data changes
Each normalized article gets a `source` field: `'NewsAPI'`, `'Guardian'`, or `'NYT'`. Added during normalization in `getArticles`.

### What does NOT change
- Pagination component and its tests
- Category filter logic
- Sort logic
- The 3-column grid layout
- Rotated pink frame overlays

---

## 2. Featured Article

### Behavior
- Shown only on page 1, only when `displayedArticles.length >= 2`
- Uses `displayedArticles[0]`; the grid renders `displayedArticles.slice(1)`
- On pages 2+, all articles go into the normal grid

### Layout
- Desktop (≥768px): image left (~55%), text right (~45%), side-by-side in a wide card
- Mobile: stacks vertically, same as a regular card

### Visual treatment
- Same rotated pink frame overlay as regular cards, slightly larger rotation offset
- `FEATURED` pill label — small, uppercase, pink gradient — top-left corner of image
- Source badge + date on one line at top of text area
- Title: ~1.6rem, bold
- Description: 4 lines visible
- "Read More" button: same style as regular cards

---

## 3. Bamboo & Panda Theming

### Masthead background
- Subtle bamboo stalk pattern using `repeating-linear-gradient` — green-tinted vertical stripes, ~4% opacity, so they don't compete with the pink/lavender

### Section divider
- A decorative rule element rendered in JSX between `</header>` and the featured article: thin line + `🎋` centered in it. The masthead's CSS `border-bottom` is removed in favour of this element.

### No-image placeholder
- `🐼` large and centered on the existing soft gradient
- `"No image available"` in small muted text below it

### Loading skeleton
- While `articles === ''` (initial fetch), render 6 `SkeletonCard` components in the grid
- Each skeleton matches the card shape: a grey shimmer block for the image area, two shimmer lines for title, three for description
- Shimmer animation: pink-to-lavender gradient sweep, 1.5s loop

### Source badges
- Small pill in the top-right of every article's image area (including featured), sits above the rotated frame (`z-index: 4`)
- `NYT` — dark charcoal background, white text
- `Guardian` — dark teal background, white text  
- `NewsAPI` — pink gradient background, white text
- 10px, uppercase, bold, 5px border-radius

---

## 4. Card Visual Hierarchy & Cleanup

### Removals
- `✧ ✦ ✧` stars (`article-body::before`) — removed entirely
- `margin-bottom: 20px` on `.article` — removed (grid `gap` handles spacing)

### Card body layout
- **Top line:** `{source} · {date}` in one `<span>` — replaces the standalone date span
- **Title:** same size (1rem), hover color shifts plum → pink
- **Description:** capped at 3 lines via `-webkit-line-clamp: 3`; `flex: 1` on the description so Read More stays at bottom
- **Read More:** always bottom-aligned within the card body

### Card hover
- Existing `translateY(-5px) scale(1.012)` stays
- Add a 3px pink left border accent on hover (`border-left: 3px solid var(--pink)`)

---

## 5. Footer

### Layout
Centered, three rows:
1. `🎋 🐼 🎋` decorative row
2. `The Panda Post` — gradient text treatment, ~1rem
3. `Powered by NewsAPI · The Guardian · NY Times` — small, muted uppercase, each a link to the source homepage

### Styling
- Same gradient background as masthead (`#FFE4F0 → #EFE4FF`)
- `border-top: 3px solid var(--pink)` mirroring masthead
- Same `box-shadow` as masthead, pointing downward
- 32px top/bottom padding

---

## Out of Scope
- Search functionality changes
- API or data layer changes beyond adding `source` field
- Pagination logic changes
- Mobile-specific nav changes
