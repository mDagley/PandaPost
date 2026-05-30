import './App.css';
import React, {useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from './Pagination';


const Article = (article) => {

  return (
    <div className='article'>
      {article.urlToImage && <img className='articleImage' src={article.urlToImage} alt={article.title} referrerPolicy="no-referrer"/>}
      <h2>{article.title}</h2>
      <p>{(article.description || '').replace('Read more...', '')}</p>
      <a href={article.url} target="blank">Read More</a>
    </div>
  );
}

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
      })
      .catch(() => {
        setError('Failed to load articles. Please try again later.');
        setArticles([]);
      });
  }, []);

  useEffect(() => {
    getArticles();
  }, [getArticles]);

  const totalPages = Array.isArray(articles) ? Math.ceil(articles.length / pageSize) : 0;
  const displayedArticles = Array.isArray(articles)
    ? articles.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

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
}

export default App;
