import { connect } from 'react-redux';
import App from '../components/App';
import { fetchTracks } from '../actions/songsActions';

const mapStateToProps = (state) => {
  const { songs } = state;
  return {
    songs,
  }
};

const mapDispatchToProps = dispatch => ({
  trackSearch: (track) => console.log(track),
  albumSearch: (album) => console.log(album),
  getPlaylistTracks: () => dispatch(fetchTracks()),
});

const HomeContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default HomeContainer;
