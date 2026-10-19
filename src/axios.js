import axios from "axios";

const apiKey = process.env.REACT_APP_TMDB_API_KEY?.trim();

const instance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 15000,
  params: {
    language: "en-US",
    ...(apiKey ? { api_key: apiKey } : {}),
  },
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!apiKey) {
      console.error(
        "TMDB API key is missing. Check client/.env and restart the development server.",
      );
    } else if (error.response?.status === 401) {
      console.error(
        "TMDB authentication failed. Verify that REACT_APP_TMDB_API_KEY contains a valid TMDB v3 API key.",
      );
    } else {
      console.error(
        "TMDB request failed:",
        error.response?.status || error.message,
      );
    }

    return Promise.reject(error);
  },
);

export default instance;
