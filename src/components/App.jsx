import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      track: '',
      album: '',
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.props.getPlaylistTracks();
  }

  handleInputChange(event) {
    const { target } = event;
    this.setState({
      [target.name]: target.value,
    })
  }

  render() {
    return (
      <div>
        <h1>Playlist</h1>
        <div>
          <input
            type="text"
            name="track"
            value={this.state.track}
            placeholder="Search for a track"
            onChange={this.handleInputChange}
          />
          <button
            onClick={() => {
              this.setState({
                track: '',
              })
              this.props.trackSearch(this.state.track)
            }}
          >Search for track</button>
        </div>
        <div>
          <input
            type="text"
            name="album"
            value={this.state.album}
            placeholder="search for an album"
            onChange={this.handleInputChange}
          />
          <button
            onClick={() => {
              this.setState({
                album: '',
              })
              this.props.albumSearch(this.state.album)
            }}
          >Search for album</button>
        </div>
        <div>
          <h4>Current playlist songs</h4>
        </div>
      </div>
    )
  }
}

export default App;
