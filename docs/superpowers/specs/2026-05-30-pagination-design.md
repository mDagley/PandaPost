---
title: Pagination Design
date: 2026-05-30
---

## Overview

Add numbered pagination to PandaPost and bump both news APIs to their maximum result limits.

## API Changes

- **NewsAPI**: add `pageSize=100` to fetch up to 100 articles per request
- **Guardian API**: add `page-size=200` to fetch up to 200 articles per request
- Both calls remain unchanged otherwise; filtering logic is unaffected

## State

Add to `App`:
- `currentPage` (integer, default 1) — reset to 1 whenever `setArticles` is called or `pageSize` changes
- `pageSize` (integer, default 20) — controlled by a dropdown

## Articles Per Page Dropdown

A `<select>` rendered near the pagination controls with options 10, 20, 50. Changing the value updates `pageSize` and resets `currentPage` to 1.

## Displayed Articles

Derive `displayedArticles` from the full filtered `articles` array:

```
displayedArticles = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize)
```

Pass `displayedArticles` to `ArticleGrid` instead of `articles`.

## Pagination Component

New `Pagination` component rendered below `ArticleGrid`. Receives `currentPage`, `totalPages`, and `onPageChange` as props.

- Prev button: disabled when `currentPage === 1`
- Numbered buttons: one per page, current page visually highlighted
- Next button: disabled when `currentPage === totalPages`
- Hidden entirely when `totalPages <= 1`

## Data Flow

```
fetch → filter → articles[] (full set)
                     ↓
           currentPage + articles[]
                     ↓
           displayedArticles[] (slice of 20)
                     ↓
              ArticleGrid + Pagination
```

## Error Handling

Each API call is independent — a failure in one must not block results from the other. This is already handled by `Promise.allSettled`.

Add an `error` state to `App` (default `null`). Logic after settlement:

- Both fail → set `error` to a user-facing message, leave `articles` empty
- One fails → show that API's results normally; show a dismissable warning banner indicating partial results
- Both succeed → clear `error`, display results normally

`ArticleGrid` displays an error message instead of "Loading..." when `error` is set and `articles` is empty. The warning banner (partial failure) is rendered above the grid and does not replace it.
