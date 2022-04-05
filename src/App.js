import './App.css';
import React, {useEffect, useState } from 'react';
import axios from 'axios';


const Article = (article) => {
  
  return (
    <div className='article'>
      <img className='articleImage' src={article.urlToImage} alt={article.title}/>
      <h2>{article.title}</h2>
      <p>{article.description.replace('Read more...', '')}</p>
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
    axios({
      'method': 'GET',
      'url': 'https://newsapi.org/v2/everything?q=%22panda%22%20AND%20NOT%20fiat%20AND%20NOT%20Nike%20AND%20NOT%20%22New%20Balance%22 &searchIn=title&apikey=' + process.env.REACT_APP_NEWS_API_KEY,
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
