const dotenv = require('dotenv');
const request = require('request');
const Promise = require('bluebird');

dotenv.config();

const playlist_id = process.env.SPOTIFY_PLAYLIST_ID;
const user_id = process.env.SPOTIFY_USER_NAME;

const addToPlaylist = (user, spotifyValue, access_token) => {
  const spotifyRegex = /\/([a-z,A-Z,0-9]{22})$/;
  if (spotifyValue.indexOf('album') === -1) {
    const trackId = spotifyRegex.exec(spotifyValue)[1];
    return new Promise((resolve, reject) => {
      request({
        url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,
        headers: { Authorization: `Bearer ${access_token}` },
        qs: { uris: `spotify:track:${trackId}` }, //Query string data
        method: 'POST', //Specify the method
      }, (err, response, body) => {
        const returnMessage = {
          response_type: 'in_channel',
          text: spotifyValue,
          attachments: [{
            pretext: `added by ${user}`,
          }]
        }
        resolve(returnMessage);
      })
    })
  } else {
    //get album tracks and then add tracks
    const albumId = spotifyIDRegex.exec(spotifyValue)[1];
    return new Promise((resolve, reject) => {
      request({
        url: `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${access_token}`
        }
      }, (err, response, body) => {
        const responseBody = JSON.parse(body);
        const tracksString = responseBody.items.map(track => track.uri).join(',');
        request({
          url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,
          headers: { Authorization: `Bearer ${access_token}` },
          qs: { uris: tracksString }, //Query string data
          method: 'POST', //Specify the method
        }, (err, response, body) => {
          resolve({
            response_type: 'in_channel',
            text: spotifyValue,
            attachments: [{
              pretext: `added by ${user}`,
            }]
          });
        })
      });
    })
  }
}

module.exports = addToPlaylist;
