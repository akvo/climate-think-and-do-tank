import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import knowledgeHubReducer from './slices/knowledgeHubSlice';
import investmentOpportunityReducer from './slices/investmentOpportunitySlice';
import newsEventsReducer from './slices/newsEventsSlice';

const appReducer = combineReducers({
  auth: authReducer,
  knowledgeHub: knowledgeHubReducer,
  investmentOpportunity: investmentOpportunityReducer,
  newsEvents: newsEventsReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
