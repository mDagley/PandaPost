import './App.css';
import React, {useEffect, useState } from 'react';
import axios from 'axios';


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

const ArticleGrid = (props) => {
  if(props.articles !== undefined && props.articles !== ''){
    console.log('ArticleGrid ', props.articles)
    return (
      <div id='articleGrid'>
        {props.articles.map(article => <Article key={article.title} {...article} />)}
      </div>
    )
  }

  else {
    return (<h3>Loading...</h3>)
  }

}

function App() {
  let [articles, setArticles] = useState('');

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
        const combined = [...newsArticles, ...guardianArticles]
          .filter(isPandaRelated);
        setArticles(combined);
      });
  }, []);

  useEffect(() => {
    getArticles()
  }, [getArticles])

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
      <ArticleGrid articles = {articles}/>
    </div>
  );
}

export default App;
