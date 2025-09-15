import "./App.css";
import Banner from "./Components/BannerSection/Banner";
import Nav from "./Components/NavSection/Nav"
import Rows from "./Components/Rows/Rows";
import request from "./requests";
function App() {
  return (
    <div className="App">
      <Nav></Nav>
      <Banner></Banner>
      <Rows
        title="Netflix Originals"
        fetchUrl={request.fetchNetflixOriginals}
        isLargeRow
      />
      <Rows title="Trending Now" fetchUrl={request.fetchTrending} />

      <Rows title="Top Rated" fetchUrl={request.fetchTopRatedMovies} />
      <Rows title="Action Movies" fetchUrl={request.fetchActionMovies} />
      <Rows title="Comedy Movies" fetchUrl={request.fetchComedyMovies} />
      <Rows title="Horror Movies" fetchUrl={request.fetchHorrorMovies} />
      <Rows title="Romance Movies" fetchUrl={request.fetchRomanMovies} />
      <Rows
        title="Documentaries Movies"
        fetchUrl={request.fetchDocumentaries}
      />

      <Rows
        title="Action and Adventure Movies"
        fetchUrl={request.fetchActionAdventure}
      />
      <Rows title="Thriller Movies" fetchUrl={request.fetchThrillers} />
      <Rows title="Family Movies" fetchUrl={request.fetchFamilyMovies} />
      <Rows title="Emotional Movies" fetchUrl={request.fetchEmotional} />
      <Rows title="Animated Movies" fetchUrl={request.fetchAnimated} />
      <Rows title="Drama Movies" fetchUrl={request.fetchDrama} />
      <Rows title="Mystery Movies" fetchUrl={request.fetchMystery} />
      <Rows title="Historical Movies" fetchUrl={request.fetchHistorical} />
    </div>
  );
}

export default App;
