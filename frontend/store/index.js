import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const appReducer = combineReducers({
  auth: authReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
