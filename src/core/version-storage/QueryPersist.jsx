import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

//EXPLANATION: Persist only specific queries
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      return query.queryKey[0] === "home-countries";
    },
  },
});

//EXPLANATION : I am choosing the persister
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "react-query-cache",
});
