import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import knowledgeHubReducer from './slices/knowledgeHubSlice';

const appReducer = combineReducers({
  auth: authReducer,
  knowledgeHub: knowledgeHubReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
