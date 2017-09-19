import { combineReducers } from 'redux';
import SongsReducer from './songsReducer';

const rootReducer = combineReducers({
  songs: SongsReducer,
});

export default rootReducer;
