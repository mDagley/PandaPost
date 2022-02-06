import './App.css';
import React, {useEffect, useState } from 'react';
import axios from 'axios';


const Article = (article) => {
  
  return (
    <div className='article'>
      <img className='articleImage' src={article.urlToImage} />
      <h2>{article.title}</h2>
      <p>{article.description}</p>
      <a>Read More...</a>
    </div>
  );
}

const ArticleGrid = (props) => {
  if(props.articles != undefined && props.articles != ''){
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
    axios({
      'method': 'GET',
      'url': 'https://newsapi.org/v2/everything?q=%22giant%20panda%22&searchIn=title&from=2022-02-05&to=2019-02-05&sortBy=popularity',
      'headers': {
        'X-API-Key': process.env.REACT_APP_NEWS_API_KEY
      }
    })
    .then((response) => {
      setArticles(response.data.articles)
    })
    .catch((error) => {
      console.log(error)
    })
  }, []); 
  
  useEffect(() => {
    getArticles()
  }, [getArticles])

  return (
    <div className="App">
      <div className='title'>
        <h1>The Panda Post</h1>
      </div>
      <ArticleGrid articles = {articles}/>
    </div>
  );
}

export default App;
