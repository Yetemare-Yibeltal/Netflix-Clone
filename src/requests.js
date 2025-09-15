const API_KEY = "250f4f71e5dbe17ce99c950c263e553e";
// this is test json file example form;
// https://api.themoviedb.org/3/trending/all/day?api_key=250f4f71e5dbe17ce99c950c263e553e

const request = {
  fetchTrending: `/trending/all/week?api_key=${API_KEY}&language=en-US`,
  fetchNetflixOriginals: `/discover/tv?api_key=${API_KEY}&with_networks=213`,
  fetchTopRatedMovies: `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
  fetchActionMovies: `/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchComedyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?api_key=${API_KEY}&with_genres=27`,
  fetchRomanMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
  fetchDocumentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99`,
  fetchActionAdventure: `/discover/movie?api_key=${API_KEY}&with_genres=28,12`,
  fetchThrillers: `/discover/movie?api_key=${API_KEY}&with_genres=53`,
  fetchFamilyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10751`,
  fetchEmotional: `/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000`,
 fetchAnimated : `/discover/movie?api_key=${API_KEY}&with_genres=16`,
 fetchDrama : `/discover/movie?api_key=${API_KEY}&with_genres=18`,
fetchMystery :`/discover/movie?api_key=${API_KEY}&with_genres=9648`,
fetchHistorical : `/discover/movie?api_key=${API_KEY}&with_genres=36`
};
export default request;
