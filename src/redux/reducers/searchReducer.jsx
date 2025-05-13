import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  related_search: {
    region: null,
    countries: [],
  },
};

const SearchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    AttachSearch: (state, action) => {
      return {
        ...state,
        related_search: {
          ...state.related_search,
          ...action.payload,
        },
      };
    },
    DetachSearch: (state, action) => {
      return {
        ...state,
        ...initialState,
      };
    },
  },
});

export const { AttachSearch, DetachSearch } = SearchSlice.actions;
export default SearchSlice.reducer;
