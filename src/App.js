import './App.css';

const Article = () => {
  return (
    <div className='article'>
      <h2>Article Title</h2>
      <p>A 2006 New York Times article outlined the economics of keeping pandas, which costs five times more than keeping the next most expensive animal, an elephant. American zoos generally pay the Chinese government $1 million a year in fees, as part of a typical ten-year contract. San Diego's contract with China was to expire in 2008, but got a five-year extension at about half of the previous yearly cost. The last contract, with the Memphis Zoo in Memphis, Tennessee, ended in 2013.</p>
      <a>Read More...</a>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <div className='title'>
        <h1>The Panda Post</h1>
      </div>
      <div id='articleGrid'>
        <Article />
        <Article />
        <Article />
        <Article />
        <Article />
        <Article />
      </div>
    </div>
  );
}

export default App;
