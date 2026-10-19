import axios from "axios";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const instance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
  params: apiKey
    ? {
        api_key: apiKey,
        language: "en-US",
      }
    : {},
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("TMDB request timed out. Please try again.");
    } else if (error.response) {
      console.error(
        `TMDB request failed with status ${error.response.status}.`,
      );
    } else {
      console.error("Unable to reach TMDB. Check your internet connection.");
    }

    return Promise.reject(error);
  },
);

export default instance;
