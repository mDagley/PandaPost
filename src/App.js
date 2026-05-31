import './App.css';
import React, {useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from './Pagination';


const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const decodeHtml = (str) => {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value.replace(/<[^>]*>/g, '');
};

const Article = (article) => {
  const sourceCls = article.source
    ? `source-badge source-badge--${article.source.toLowerCase().replace(/\s+/g, '')}`
    : null;
  const meta = [article.source, formatDate(article.publishedAt)].filter(Boolean).join(' · ');
  return (
    <div className='article'>
      <div className='article-image-wrapper'>
        {sourceCls && <span className={sourceCls}>{article.source}</span>}
        {article.urlToImage
          ? <img className='articleImage' src={article.urlToImage} alt={article.title} referrerPolicy="no-referrer"/>
          : <div className='article-no-image'/>
        }
      </div>
      <div className='article-body'>
        {meta && <span className='article-meta'>{meta}</span>}
        <h2>{article.title}</h2>
        <p>{decodeHtml(article.description).replace('Read more...', '').trim()}</p>
        <a href={article.url} className='read-more' target="_blank" rel="noopener noreferrer">Read More</a>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className='article skeleton'>
    <div className='skeleton-image'/>
    <div className='skeleton-body'>
      <div className='skeleton-line skeleton-meta'/>
      <div className='skeleton-line skeleton-title'/>
      <div className='skeleton-line skeleton-title skeleton-short'/>
      <div className='skeleton-line skeleton-text'/>
      <div className='skeleton-line skeleton-text'/>
      <div className='skeleton-line skeleton-text skeleton-short'/>
    </div>
  </div>
);

const FeaturedArticle = ({ article }) => {
  if (!article) return null;
  const sourceCls = article.source
    ? `source-badge source-badge--${article.source.toLowerCase().replace(/\s+/g, '')}`
    : null;
  const meta = [article.source, formatDate(article.publishedAt)].filter(Boolean).join(' · ');
  return (
    <div className='featured-article'>
      <div className='featured-image-wrapper'>
        <span className='featured-label'>Featured</span>
        {sourceCls && <span className={sourceCls}>{article.source}</span>}
        {article.urlToImage
          ? <img className='featured-image' src={article.urlToImage} alt={article.title} referrerPolicy="no-referrer"/>
          : <div className='article-no-image featured-no-image'/>
        }
      </div>
      <div className='featured-body'>
        {meta && <span className='article-meta'>{meta}</span>}
        <h2 className='featured-title'>{article.title}</h2>
        <p className='featured-description'>{decodeHtml(article.description).replace('Read more...', '').trim()}</p>
        <a href={article.url} className='read-more' target="_blank" rel="noopener noreferrer">Read More</a>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className='site-footer'>
    <div className='footer-title'>The Panda Post</div>
    <div className='footer-credits'>
      Powered by{' '}
      <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>
      {' · '}
      <a href="https://www.theguardian.com" target="_blank" rel="noopener noreferrer">The Guardian</a>
      {' · '}
      <a href="https://developer.nytimes.com" target="_blank" rel="noopener noreferrer">NY Times</a>
    </div>
  </footer>
);

const ArticleGrid = ({ articles, error }) => {
  if (error) return <h3 className='error-message'>{error}</h3>;
  if (!articles || articles === '') return (
    <div id='articleGrid'>
      {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
  if (articles.length === 0) return <h3>No articles found.</h3>;
  return (
    <div id='articleGrid'>
      {articles.map(article => <Article key={article.title} {...article} />)}
    </div>
  );
};

const CATEGORY_FILTERS = {
  All:         null,
  Cubs:        /cub|baby|babies|born|birth|newborn|infant|juvenile|young|pup/i,
  Conservation:/conservation|endangered|habitat|protect|wildlife|extinct|species|poach|illegal|forest|wild/i,
  Zoos:        /zoo|captive|breed|breeding|sanctuary|reserve|enclosure|aquarium|keeper|loan/i,
  Diplomacy:   /diplomacy|diplomatic|gift|gifted|loan|lend|donated|ambassador|bilateral|international|relations/i,
};

function App() {
  const [articles, setArticles] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState(null);
  const [partialError, setPartialError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

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

    const nytApiCall = axios({
      method: 'GET',
      url: `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=%22giant+panda%22+OR+%22red+panda%22&sort=newest&api-key=${process.env.REACT_APP_NYTIMES_API_KEY}`,
    });

    Promise.allSettled([newsApiCall, guardianApiCall, nytApiCall])
      .then(([newsResult, guardianResult, nytResult]) => {
        const allFailed = [newsResult, guardianResult, nytResult].every(r => r.status === 'rejected');

        if (allFailed) {
          setError('Failed to load articles. Please try again later.');
          setArticles([]);
          return;
        }

        const failedSources = [
          newsResult.status === 'rejected' && 'NewsAPI',
          guardianResult.status === 'rejected' && 'The Guardian',
          nytResult.status === 'rejected' && 'NY Times',
        ].filter(Boolean);

        if (failedSources.length > 0) {
          setPartialError(`Some articles may be missing — ${failedSources.join(', ')} could not be reached.`);
        } else {
          setPartialError(null);
        }
        setError(null);

        const newsArticles = newsResult.status === 'fulfilled'
          ? (newsResult.value.data.articles || []).map(a => ({ ...a, source: 'NewsAPI' }))
          : [];
        const guardianArticles = guardianResult.status === 'fulfilled'
          ? (guardianResult.value.data.response.results || []).map(item => ({
              title: item.webTitle,
              url: item.webUrl,
              urlToImage: item.fields?.thumbnail || null,
              description: item.fields?.trailText || '',
              publishedAt: item.webPublicationDate || null,
              source: 'Guardian',
            }))
          : [];
        const nytArticles = nytResult.status === 'fulfilled'
          ? (nytResult.value.data.response.docs || []).map(doc => ({
              title: doc.headline?.main || '',
              url: doc.web_url,
              urlToImage: doc.multimedia?.[0]?.url
                ? `https://www.nytimes.com/${doc.multimedia[0].url}`
                : null,
              description: doc.abstract || doc.lead_paragraph || '',
              publishedAt: doc.pub_date || null,
              source: 'NYT',
            }))
          : [];

        const isExcluded = (text) => /krystal niu|acrobat/i.test(text || '');
        const isPandaRelated = (article) =>
          /giant panda|red panda/i.test(article.title) &&
          !isExcluded(article.title) &&
          !isExcluded(article.description);

        setArticles([...newsArticles, ...guardianArticles, ...nytArticles].filter(isPandaRelated));
        setCurrentPage(1);
      })
      .catch(() => {
        setError('Failed to load articles. Please try again later.');
        setArticles([]);
      });
  }, []);

  useEffect(() => {
    getArticles();
  }, [getArticles]);

  const categoryRegex = CATEGORY_FILTERS[activeCategory];
  const categoryFiltered = Array.isArray(articles)
    ? (categoryRegex
        ? articles.filter(a => categoryRegex.test(a.title) || categoryRegex.test(a.description || ''))
        : articles)
    : [];

  const searchLower = searchQuery.trim().toLowerCase();
  const filteredArticles = searchLower
    ? categoryFiltered.filter(a =>
        (a.title || '').toLowerCase().includes(searchLower) ||
        (a.description || '').toLowerCase().includes(searchLower)
      )
    : categoryFiltered;

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortOrder === 'date-desc') return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    if (sortOrder === 'date-asc')  return new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0);
    if (sortOrder === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    if (sortOrder === 'title-desc') return (b.title || '').localeCompare(a.title || '');
    return 0;
  });

  const totalPages = Math.ceil(sortedArticles.length / pageSize);
  const displayedArticles = sortedArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const showFeatured = currentPage === 1 && displayedArticles.length >= 2;
  const featuredArticle = showFeatured ? displayedArticles[0] : null;
  const gridArticles = showFeatured ? displayedArticles.slice(1) : displayedArticles;

  return (
    <div className="App">
      <header className='masthead'>
        <div className='masthead-top'>
          <div className='masthead-search'>
            <input
              type="text"
              className='search-field'
              placeholder='Search articles...'
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            <input type="submit" value="Search" className='search-button' onClick={() => setCurrentPage(1)}/>
          </div>
          <div className='masthead-date'>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className='masthead-title'>
          <h1>The Panda Post</h1>
          <p className='masthead-tagline'>your daily dose of panda news</p>
        </div>
        <nav className='masthead-nav'>
          <ul>
            {Object.keys(CATEGORY_FILTERS).map(cat => (
              <li
                key={cat}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className='section-divider'><span/></div>
      {partialError && (
        <div className='warning-banner'>
          {partialError}
          <button onClick={() => setPartialError(null)}>✕</button>
        </div>
      )}
      <div className='articles-controls'>
        <label className='page-size-label'>
          Sort by:
          <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}>
            <option value='date-desc'>Newest first</option>
            <option value='date-asc'>Oldest first</option>
            <option value='title-asc'>Title A–Z</option>
            <option value='title-desc'>Title Z–A</option>
          </select>
        </label>
        <label className='page-size-label'>
          Per page:
          <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={40}>40</option>
          </select>
        </label>
      </div>
      <FeaturedArticle article={featuredArticle} />
      <ArticleGrid articles={gridArticles} error={error} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <Footer />
    </div>
  );
}

export { SkeletonCard, FeaturedArticle };
export default App;
