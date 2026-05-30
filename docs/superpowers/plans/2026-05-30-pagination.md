# Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add numbered pagination with a configurable page size dropdown, bump both news APIs to their max result limits, and show error/warning banners when API calls fail.

**Architecture:** All articles are fetched once at max page size from both APIs, filtered client-side, then sliced into pages of 10/20/50 for display. A new `Pagination` component handles page navigation and page size selection. Error state in `App` drives a full error message (both fail) or a dismissable warning banner (one fails).

**Tech Stack:** React 17, Create React App (Jest + React Testing Library), axios

---

### Task 1: Bump API page sizes

**Files:**
- Modify: `src/App.js:44,49`

- [ ] **Step 1: Add `pageSize=100` to the NewsAPI URL and `page-size=200` to the Guardian URL**

In `src/App.js`, replace the two URL strings:

```js
// NewsAPI — add &pageSize=100 before &apikey
url: `https://newsapi.org/v2/everything?q=(%22giant%20panda%22%20OR%20%22red%20panda%22)%20AND%20NOT%20fiat%20AND%20NOT%20Nike%20AND%20NOT%20%22New%20Balance%22%20AND%20NOT%20%22Panda%20Express%22&from=${fromDate}&pageSize=100&apikey=${process.env.REACT_APP_NEWS_API_KEY}`,

// Guardian — add &page-size=200 before &api-key
url: `https://content.guardianapis.com/search?q=%22giant%20panda%22%20OR%20%22red%20panda%22&show-fields=thumbnail,trailText&page-size=200&api-key=${process.env.REACT_APP_GUARDIAN_API_KEY}`,
```

- [ ] **Step 2: Verify in browser network tab**

Open DevTools → Network, reload the app. Confirm the NewsAPI request URL contains `pageSize=100` and the Guardian request URL contains `page-size=200`.

- [ ] **Step 3: Commit**

```bash
git add src/App.js
git commit -m "feat: bump NewsAPI to 100 and Guardian to 200 results per request"
```

---

### Task 2: Create Pagination component with tests

**Files:**
- Create: `src/Pagination.test.js`
- Create: `src/Pagination.js`

- [ ] **Step 1: Write failing tests**

Create `src/Pagination.test.js`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

test('renders correct number of page buttons', () => {
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('prev button is disabled on first page', () => {
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('Prev')).toBeDisabled();
});

test('next button is disabled on last page', () => {
  render(<Pagination currentPage={3} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('Next')).toBeDisabled();
});

test('clicking page button calls onPageChange with correct page number', () => {
  const mockOnPageChange = jest.fn();
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={mockOnPageChange} onPageSizeChange={() => {}} />);
  fireEvent.click(screen.getByText('2'));
  expect(mockOnPageChange).toHaveBeenCalledWith(2);
});

test('changing pageSize dropdown calls onPageSizeChange with numeric value', () => {
  const mockOnPageSizeChange = jest.fn();
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={mockOnPageSizeChange} />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
  expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
});

test('page navigation controls not rendered when totalPages is 1', () => {
  render(<Pagination currentPage={1} totalPages={1} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.queryByText('Prev')).not.toBeInTheDocument();
  expect(screen.queryByText('Next')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
cd C:\Users\panda\Claude\PandaPost
CI=true npm test -- --testPathPattern=Pagination --watchAll=false
```

Expected: all 6 tests fail with `Cannot find module './Pagination'`.

- [ ] **Step 3: Create `src/Pagination.js`**

```jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }) => {
  return (
    <div className='pagination'>
      <div className='page-size-control'>
        <label>
          Articles per page:
          <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      {totalPages > 1 && (
        <div className='page-controls'>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
```

- [ ] **Step 4: Run tests to confirm they all pass**

```bash
CI=true npm test -- --testPathPattern=Pagination --watchAll=false
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/Pagination.js src/Pagination.test.js
git commit -m "feat: add Pagination component with page size dropdown"
```

---

### Task 3: Add error state and failure banners to App

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Add `error` and `partialError` state, update `Promise.allSettled` handler**

Replace the entire `getArticles` function body in `src/App.js`:

```jsx
function App() {
  const [articles, setArticles] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState(null);
  const [partialError, setPartialError] = useState(null);

  const getArticles = React.useCallback(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const fromDate = oneMonthAgo.toISOString().split('T')[0];

    const newsApiCall = axios({
      method: 'GET',
      url: `https://newsapi.org/v2/everything?q=(%22giant%20panda%22%20OR%20%22red%20panda%22)%20AND%20NOT%20fiat%20AND%20NOT%20Nike%20AND%20NOT%20%22New%20Balance%22%20AND%20NOT%20%22Panda%20Express%22&from=${fromDate}&pageSize=100&apikey=${process.env.REACT_APP_NEWS_API_KEY}`,
    });

    const guardianApiCall = axios({
      method: 'GET',
      url: `https://content.guardianapis.com/search?q=%22giant%20panda%22%20OR%20%22red%20panda%22&show-fields=thumbnail,trailText&page-size=200&api-key=${process.env.REACT_APP_GUARDIAN_API_KEY}`,
    });

    Promise.allSettled([newsApiCall, guardianApiCall])
      .then(([newsResult, guardianResult]) => {
        const bothFailed = newsResult.status === 'rejected' && guardianResult.status === 'rejected';

        if (bothFailed) {
          setError('Failed to load articles. Please try again later.');
          setArticles([]);
          return;
        }

        const oneFailed = newsResult.status === 'rejected' || guardianResult.status === 'rejected';
        if (oneFailed) {
          const failedSource = newsResult.status === 'rejected' ? 'NewsAPI' : 'The Guardian';
          setPartialError(`Some articles may be missing — ${failedSource} could not be reached.`);
        } else {
          setPartialError(null);
        }
        setError(null);

        const newsArticles = newsResult.status === 'fulfilled'
          ? newsResult.value.data.articles || []
          : [];
        const guardianArticles = guardianResult.status === 'fulfilled'
          ? (guardianResult.value.data.response.results || []).map(item => ({
              title: item.webTitle,
              url: item.webUrl,
              urlToImage: item.fields?.thumbnail || null,
              description: item.fields?.trailText || '',
            }))
          : [];

        const isExcluded = (text) => /krystal niu|acrobat/i.test(text || '');
        const isPandaRelated = (article) =>
          /giant panda|red panda/i.test(article.title) &&
          !isExcluded(article.title) &&
          !isExcluded(article.description);

        setArticles([...newsArticles, ...guardianArticles].filter(isPandaRelated));
        setCurrentPage(1);
      });
  }, []);

  useEffect(() => {
    getArticles();
  }, [getArticles]);
```

- [ ] **Step 2: Update `ArticleGrid` to accept and display an `error` prop**

Replace the `ArticleGrid` component at the top of `src/App.js`:

```jsx
const ArticleGrid = ({ articles, error }) => {
  if (error) return <h3 className='error-message'>{error}</h3>;
  if (!articles || articles === '') return <h3>Loading...</h3>;
  if (articles.length === 0) return <h3>No articles found.</h3>;
  return (
    <div id='articleGrid'>
      {articles.map(article => <Article key={article.title} {...article} />)}
    </div>
  );
};
```

- [ ] **Step 3: Add the warning banner to the JSX return in `App`**

In the `return` block of `App`, add the warning banner and update the `ArticleGrid` call. Pass `articles` directly for now (Pagination wiring comes in Task 4). The full return block should be:

```jsx
  return (
    <div className="App">
      <header className='nav-bar'>
        <div className='search-bar'>
          <input type="text" className='search-field'></input>
          <input type="submit" value="Search" className='search-button'></input>
        </div>
        <nav>
          <ul>
            <li>Pandas</li>
            <li>Tech</li>
            <li>Food</li>
            <li>Travel</li>
            <li>Politics</li>
          </ul>
        </nav>
      </header>
      <div className='title'>
        <h1>The Panda Post</h1>
      </div>
      {partialError && (
        <div className='warning-banner'>
          {partialError}
          <button onClick={() => setPartialError(null)}>✕</button>
        </div>
      )}
      <ArticleGrid articles={articles} error={error} />
    </div>
  );
```

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "feat: add error state and partial failure warning banner"
```

---

### Task 4: Wire pagination state and Pagination component into App

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Add `import Pagination` at the top of `src/App.js`**

```jsx
import Pagination from './Pagination';
```

- [ ] **Step 2: Add derived values and `handlePageSizeChange` inside `App`, after the `useEffect`**

```jsx
  const totalPages = Array.isArray(articles) ? Math.ceil(articles.length / pageSize) : 0;
  const displayedArticles = Array.isArray(articles)
    ? articles.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
```

- [ ] **Step 3: Update the JSX return to use `displayedArticles` and render `<Pagination>`**

Replace the `return` block in `App` with:

```jsx
  return (
    <div className="App">
      <header className='nav-bar'>
        <div className='search-bar'>
          <input type="text" className='search-field'></input>
          <input type="submit" value="Search" className='search-button'></input>
        </div>
        <nav>
          <ul>
            <li>Pandas</li>
            <li>Tech</li>
            <li>Food</li>
            <li>Travel</li>
            <li>Politics</li>
          </ul>
        </nav>
      </header>
      <div className='title'>
        <h1>The Panda Post</h1>
      </div>
      {partialError && (
        <div className='warning-banner'>
          {partialError}
          <button onClick={() => setPartialError(null)}>✕</button>
        </div>
      )}
      <ArticleGrid articles={displayedArticles} error={error} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
```

- [ ] **Step 4: Verify the app in the browser**

Run `npm start`. Confirm:
- Articles load and are split into pages
- Page buttons appear and navigate correctly
- Prev is disabled on page 1, Next is disabled on the last page
- Changing the dropdown resets to page 1 with the new page size

- [ ] **Step 5: Commit**

```bash
git add src/App.js
git commit -m "feat: wire pagination state and Pagination component into App"
```
