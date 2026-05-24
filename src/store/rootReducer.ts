import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import authReducer from './slices/authSlice';
import { baseApi } from './api/baseApi';

const rootReducer = combineReducers({
  counter: counterReducer,
  auth: authReducer,
  // Add RTK Query API reducer
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
