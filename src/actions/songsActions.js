import fetch from 'isomorphic-fetch';

export const REQUEST_PLAYLIST_SONGS = 'REQUEST_PLAYLIST_SONGS';
export const requestPlaylistSongs = () => ({
  type: REQUEST_PLAYLIST_SONGS,
});

export const RECEIVE_PLAYLIST_SONGS = 'RECEIVE_PLAYLIST_SONGS';
export const receivePlaylistSongs = songs => ({
  type: RECEIVE_PLAYLIST_SONGS,
  data: songs,
});

export const fetchTracks = () => (dispatch) => {
  dispatch(requestPlaylistSongs);
  `https://api.spotify.com/v1/users/${process.env.SPOTIFY_USER_NAME}/playlists/${process.env.SPOTIFY_PLAYLIST_ID}`
  return fetch()
}