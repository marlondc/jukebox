const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
app.use(cookieParser());

const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

const slackSecrets = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
};

const playlist_id = process.env.SPOTIFY_PLAYLIST_ID;
const user_id = process.env.SPOTIFY_USER_NAME;
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

var generateRandomString = (length) => {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

let access_token;
let refresh_token;
// slack oauth token
// xoxp-238921206212-239954113383-238221924352-b1aaa13ebc99a0a6609ce6c0dd768c47

const refreshToken = () => {
  var refresh_token = refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
    }
  });
};

app.get('/', (req, res) => {
  res.send('done');
});

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  console.log('hello');
  // playlist-modify-public
  // your application requests authorization
  const scope = 'playlist-modify-public playlist-modify-private user-read-playback-state user-read-currently-playing user-read-recently-played user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
})

app.get('/callback', (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        refresh_token = body.refresh_token;
        setTimeout(refreshToken, 900000);
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', (req, res) => {
  
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', (req, res) => {
  // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
  if (!req.query.code) {
    res.status(500);
    res.send({"Error": "Looks like we're not getting code."});
  } else {
    request({
      url: 'https://slack.com/api/oauth.access', //URL to hit
      qs: {code: req.query.code, client_id: slackSecrets.clientId, client_secret: slackSecrets.clientSecret}, //Query string data
      method: 'GET', //Specify the method
    }, function (error, response, body) {
      if (error) {
        console.log(error);
      } else {
        res.json(body);
      }
    })
  }
});

app.post('/playlist', (req, res) => {
  request({
    url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}`,
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }, (err, response, body) => {
    if (err) {
      console.log(err);
    } else {
      const responseBody = JSON.parse(body);
      const playlistURL = responseBody.external_urls.spotify;
      res.send({
        response_type: 'in_channel',
        text: playlistURL,
      })
    }
  })
});

app.post('/add', (req, res) => {
  const user = req.body.user_name;
  const addRequest = req.body.text || 'undefined';
  const spotifyIDRegex = /\/([a-z,A-Z,0-9]{22})$/
  if (addRequest.indexOf('album') === -1) {
    //add track
    const trackId = spotifyIDRegex.exec(addRequest)[1];
    request({
      url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,
      headers: { Authorization: `Bearer ${access_token}` },
      qs: { uris: `spotify:track:${trackId}` }, //Query string data
      method: 'POST', //Specify the method
    }, (err, response, body) => {
      const responseBody = JSON.parse(body);
      if (responseBody.error) {
        res.send(responseBody.error.message);
      } else {
        request({
          url: `https://api.spotify.com/v1/tracks/${track}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`
          }
        }, (err, response, body) => {
          const responseBody1 = JSON.parse(body);
          res.send({
            response_type: 'in_channel',
            text: addRequest,
            attachments: [{
              pretext: `added by ${user}`,
            }]
          });
        })
      }
    })
  } else {
    //get album tracks and then add tracks
    const albumId = spotifyIDRegex.exec(addRequest)[1];
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
        res.send({
          response_type: 'in_channel',
          text: addRequest,
          attachments: [{
            pretext: `added by ${user}`,
          }]
        });
      })
    });
  }
})

app.post('/search', (req, res) => {
  const title = req.body.text || 'Justin Bieber';
  const user = req.body.user_name;

  request({
    url: 'https://api.spotify.com/v1/search',
    qs: {
      q: title,
      type: 'track',
      limit: 8
    },
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`
    }
  }, (err, response, body) => {
    const responseBody = JSON.parse(body);
    const tracks = responseBody.tracks.items.map((track) => {
      return `${track.name} by ${track.artists[0].name} - ID: ${track.id}`;
    })
    const trackText = tracks.join('\n')
    res.send({
      response_type: 'in_channel',
      text: trackText,
    })
  })
});

app.post('/currentlyPlaying', (req, res) => {
  request({
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`
    }
  }, (err, response, body) => {
    const responseBody = JSON.parse(body);
    const song = responseBody.item.external_urls.spotify;
    res.send({
      response_type: 'in_channel',
      text: song,
    });
  })
})

app.post('/recentlyPlayed', (req, res) => {
  request({
    url: 'https://api.spotify.com/v1/me/player/recently-played',
    qs: { limit: 5 },
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`
    }
  }, (err, response, body) => {
    const responseBody = JSON.parse(body);
    const tracks = responseBody.items.map((track) => {
      return `${track.track.name} by ${track.track.album.artists[0].name}`;
    }).join('\n');
    res.send({
      response_type: 'in_channel',
      text: tracks,
    });
  });
});

app.post('/skipSong', (req, res) => {
  request({
    url: 'https://api.spotify.com/v1/me/player/next',
    headers: {
      Authorization: `Bearer ${access_token}`
    },
    method: 'POST'
  }, (err, response, body) => {
    const user = req.body.user_name;
    res.send({
      response_type: 'in_channel',
      text: `song skipped by ${user}`,
    });
  })
});

app.post('/refresh', (req, res) => {
  res.redirect('/login');
})

app.listen(8888, () => {
  console.log('listening on port 8888');
});
