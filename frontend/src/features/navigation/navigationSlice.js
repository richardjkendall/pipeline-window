import { createSlice } from '@reduxjs/toolkit';

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    value: "all",
  },
  reducers: {
    switchToAll: state => {
      state.value = "all";
    },
    switchToRunning: state => {
      state.value = "running";
    },
    switchToFailed: state => {
      state.value = "failed";
    },
  },
});

export const { switchToAll, switchToRunning, switchToFailed } = navigationSlice.actions;

export const selectNav = state => state.navigation.value;

export default navigationSlice.reducer;