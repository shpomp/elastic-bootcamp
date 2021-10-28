import AppSearchClient from "@elastic/app-search-node";

let client = null;

if (client === null) {
  const apiKey = process.env.APP_SEARCH_API_KEY;
  const baseUrlFn = () => process.env.APP_SEARCH_BASE_URL;
  client = new AppSearchClient(undefined, apiKey, baseUrlFn);
}

export default client;
