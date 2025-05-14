// Add the labelReducer to your root reducer
import { combineReducers } from 'redux';
import authReducer from './authReducer';
import boardReducer from './boardReducer';
import listReducer from './listReducer';
import cardReducer from './cardReducer';
import activityReducer from './activityReducer';
import labelReducer from './labelReducer';
import alertReducer from './alertReducer';

export default combineReducers({
  auth: authReducer,
  board: boardReducer,
  list: listReducer,
  card: cardReducer,
  activity: activityReducer,
  label: labelReducer,
  alert: alertReducer
});