export const REQUEST_PLAYLIST_SONGS = 'REQUEST_PLAYLIST_SONGS';
export const requestPlaylistSongs = () => ({
  type: REQUEST_PLAYLIST_SONGS,
});

export const RECEIVE_PLAYLIST_SONGS = 'RECEIVE_PLAYLIST_SONGS';
export const receivePlaylistSongs = songs => ({
  type: RECEIVE_PLAYLIST_SONGS,
  data: songs,
});
