const requests = {
  fetchTrending: "/trending/all/week",
  fetchTrendingToday: "/trending/all/day",

  fetchNetflixOriginals: "/discover/tv?with_networks=213",
  fetchPopularMovies: "/movie/popular",
  fetchTopRatedMovies: "/movie/top_rated",
  fetchUpcomingMovies: "/movie/upcoming",
  fetchNowPlayingMovies: "/movie/now_playing",

  fetchPopularTV: "/tv/popular",
  fetchTopRatedTV: "/tv/top_rated",
  fetchAiringTodayTV: "/tv/airing_today",

  fetchActionMovies: "/discover/movie?with_genres=28",
  fetchAdventureMovies: "/discover/movie?with_genres=12",
  fetchComedyMovies: "/discover/movie?with_genres=35",
  fetchHorrorMovies: "/discover/movie?with_genres=27",
  fetchRomanceMovies: "/discover/movie?with_genres=10749",
  fetchDocumentaries: "/discover/movie?with_genres=99",
  fetchAnimationMovies: "/discover/movie?with_genres=16",
  fetchDramaMovies: "/discover/movie?with_genres=18",
  fetchMysteryMovies: "/discover/movie?with_genres=9648",
  fetchThrillerMovies: "/discover/movie?with_genres=53",
  fetchFamilyMovies: "/discover/movie?with_genres=10751",
  fetchHistoryMovies: "/discover/movie?with_genres=36",
  fetchScienceFictionMovies: "/discover/movie?with_genres=878",
  fetchFantasyMovies: "/discover/movie?with_genres=14",
  fetchCrimeMovies: "/discover/movie?with_genres=80",
  fetchWarMovies: "/discover/movie?with_genres=10752",
  fetchMusicMovies: "/discover/movie?with_genres=10402",

  fetchHighlyRatedMovies:
    "/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000",

  fetchActionAdventure: "/discover/movie?with_genres=28,12",
};

export default requests;
