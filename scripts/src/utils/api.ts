import { queryIndexer } from "@castgame/shared/indexer";

// GraphQL endpoint of the indexer (apps/api)
export const apiEndpoint = process.env.API_URL!;

export const queryData = (query: string) => queryIndexer(apiEndpoint, query);
