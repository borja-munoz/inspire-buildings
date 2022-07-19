import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'app',
  initialState: {
    error: null,
    bottomSheetOpen: false,
    currentThematicMap: 'construction-date',
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    setBottomSheetOpen: (state, action) => {
      state.bottomSheetOpen = action.payload;
    },
    setCurrentThematicMap: (state, action) => {
      state.error = action.payload;
    },
  },
});

export default slice.reducer;

export const setError = (payload) => ({ type: 'app/setError', payload });
export const setBottomSheetOpen = (payload) => ({
  type: 'app/setBottomSheetOpen',
  payload,
});
export const setCurrentThematicMap = (payload) => ({
  type: 'app/setCurrentThematicMap',
  payload,
});
