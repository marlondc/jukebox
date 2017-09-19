import { connect } from 'react-redux';
import App from '../components/App';

const mapStateToProps = (state) => {
  const { songs } = state;
  return {
    songs,
  }
};

const mapDispatchToProps = dispatch => ({
  onClick: () => console.log('hello'),
});

const HomeContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default HomeContainer;
