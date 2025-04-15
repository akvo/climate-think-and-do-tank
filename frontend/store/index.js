import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import knowledgeHubReducer from './slices/knowledgeHubSlice';
import investmentOpportunityReducer from './slices/investmentOpportunitySlice';

const appReducer = combineReducers({
  auth: authReducer,
  knowledgeHub: knowledgeHubReducer,
  investmentOpportunity: investmentOpportunityReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
