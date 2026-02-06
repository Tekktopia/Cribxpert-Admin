import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    email: "",
    password: "",
  },
  reducers: {
    setCredentials: (state, action) => {
      state.email = action.payload.email;
      state.password = action.payload.password;
    },
    clearCredentials: (state) => {
      state.email = "";
      state.password = "";
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
