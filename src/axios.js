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
    // Cancellation is expected when a component unmounts or
    // React Strict Mode re-runs an effect in development.
    if (
      error.code === "ERR_CANCELED" ||
      error.name === "CanceledError" ||
      axios.isCancel(error)
    ) {
      return Promise.reject(error);
    }

    if (!apiKey) {
      console.error(
        "TMDB API key is missing. Check client/.env and restart the development server.",
      );
    } else if (error.response?.status === 401) {
      console.error(
        "TMDB authentication failed. Verify REACT_APP_TMDB_API_KEY.",
      );
    } else if (error.response?.status === 403) {
      console.error(
        "TMDB access was denied. Check your API key and account permissions.",
      );
    } else if (error.response?.status === 429) {
      console.error("TMDB rate limit reached. Wait briefly before retrying.");
    } else if (!error.response) {
      console.error("TMDB network request failed:", error.message);
    } else {
      console.error(
        `TMDB request failed (${error.response.status}):`,
        error.response.data?.status_message || error.message,
      );
    }

    return Promise.reject(error);
  },
);

export default instance;
