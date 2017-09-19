import REQUEST_PLAYLIST_SONGS from '../actions/songsActions';

const intialState = {
  songs: [],
}

const song = (state = intialState, action) => {
  switch (action.type) {
    case REQUEST_PLAYLIST_SONGS: {
      return state;
    }
    
    default:
      return state;
  }
}

export default song;
