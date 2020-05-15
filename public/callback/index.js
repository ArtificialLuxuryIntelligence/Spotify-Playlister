console.log("script has loaded");

const ROOT = "https://api.spotify.com/v1";

const searchForm = document.querySelector("#searchform");
const urlForm = document.querySelector("#urlform");
const createPlaylist = document.querySelector("#create-playlist");
const resultsPage = document.querySelector("#results");
const playlists = document.querySelector("#playlists");

const addToPlaylist = document.querySelector("#add-to-playlist");

// send initial request to Spotify API
let data = {};
let userData;

window.addEventListener("load", async () => {
  //split hashed response from spotify login into object
  const hash = window.location.href
    .split("#")[1]
    .split("&")
    .map((s) => s.split("="));
  hash.forEach((pair) => (data[pair[0]] = pair[1]));
  console.log(data);
  console.log(data.access_token);

  // get spotify user data
  let url = "/me";
  userData = await spotifyQuery(url);
  console.log(userData);
});

// search for an album and displays all tracks from it
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  albumSearch(`${e.target.artist.value} ${e.target.album.value}`);
});

// Create new spotify playlist given name
createPlaylist.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log(e.target.playlistName.value);
  const playlistData = await spotifyBody(
    `/users/${userData.id}/playlists`,
    "POST",
    {
      name: e.target.playlistName.value,
      public: false,
      description: "test test description",
    }
  );
  console.log(playlistData);

  // Create new playlist title element on DOM for playlist

  let div = document.createElement("div");
  let check = document.createElement("input");
  check.type = "checkbox";
  let title = document.createElement("span");
  check.setAttribute("id", playlistData.id);
  title.innerText = playlistData.name;

  div.append(check);
  div.append(title);
  playlists.append(div);
});

// Adds all checked items to created playlist
//TO DO add checkbox => multiple playlists

addToPlaylist.addEventListener("click", () => {
  let checked = resultsPage.querySelectorAll("input[type=checkbox]:checked");
  let uris = [];
  checked.forEach((box) => {
    //add track uri to array
    uris.push(box.id);
    //remove track from DOM
    box.parentElement.remove();
  });
  console.log(uris);

  //API accepts maximum 100 uris per request
  let urisSplit = chunkArray(uris, 95);
  console.log(urisSplit);

  let playlistId = playlists.querySelector("input[type=checkbox]:checked");

  // spotifyBody(`/playlists/${playlistId.id}/tracks`, "POST", { uris: uris });
  // /playlists/{playlist_id}/tracks

  //change this:
  loopWithDelay(
    [urisSplit],
    2500,
    (uris) =>
      spotifyBody(`/playlists/${playlistId.id}/tracks`, "POST", { uris: uris }),
    () => {} //only using first section here
  );
});

function chunkArray(array, chunk_size) {
  let results = [];

  while (array.length) {
    results.push(array.splice(0, chunk_size));
  }

  return results;
}

// scrapes this url (only works for a few wfmu urls)
urlForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("fetching");
  console.log(e.target.url.value);

  console.log("fetching scraped data");
  let res = await fetch(
    "/scrapethis",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: e.target.url.value }),
    },
    "POST"
  );
  //data.data format: [ ["artist-album", "artist-album",... ],...] // currently broken down into one array per ul on page
  let data = await res.json();
  console.log(data);

  // for every artist album pair returned, return every track ... (large batch operation)
  loopWithDelay(data.data, 2500, albumSearch, addSectionTitle);

  function addSectionTitle(i) {
    sectionTitle = document.createElement("h2");
    sectionTitle.innerText = `Section ${i + 1}`;
    resultsPage.appendChild(sectionTitle);
  }
});

// ----------------------------------------------------------------------------------------------------------------
//Make request to Spotify API

async function spotifyQuery(url, method = "GET") {
  let res = await fetch(ROOT + url, {
    method: method,
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });
  let results = await res.json();
  return results;
}

async function spotifyBody(url, method = "GET", body = {}) {
  let res = await fetch(ROOT + url, {
    method: method,
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let results = await res.json();
  return results;
}

//implementations :

//searches for all tracks from album and displays
async function albumSearch(query) {
  console.log("searching for album");
  //search for album with string query

  try {
    const data = await spotifyQuery(
      "/search?" +
        paramGen({
          q: query,
          type: "album",
          limit: 1,
        })
    );

    let albumId = data.albums.items[0].id;
    // search for tracks from album with albumId
    let d = await spotifyQuery(`/albums/${albumId}`);
    console.log(d);

    //render results
    displayAlbumQuery(query);
    displayTracks(d);
  } catch (e) {
    // console.log(e);
    console.log("probably couldn't find album", query);
    displayAlbumError(query);
  }
}

// ----------------------------------------------------------------------------------------------------------------

// Helper functions

// Generate paramater string for query requests
function paramGen(params = {}) {
  keys = Object.keys(params);
  values = Object.values(params);
  let p = keys
    .map((key, i) => encodeURI(key) + "=" + encodeURI(values[i]))
    .join("&");
  return p;
}

//callback function acts on each element of all nested arrays (1 deep) with delay between each
function loopWithDelay(
  a = [[], [], []],
  delay,
  callback,
  betweenArray1Loops = function (i) {
    console.log("between loops ", i);
  }
) {
  let loop = 0;
  let subloop = 0;

  const looper = function () {
    if (loop == a.length) {
      console.log("Loop end.");
      return;
    } else if (subloop < a[loop].length) {
      if (subloop == 0) {
        betweenArray1Loops(loop);
      }
      callback(a[loop][subloop]);
      subloop++;
      if (subloop == a[loop].length) {
        subloop = 0;
        loop++;
      }
    }
    setTimeout(looper, delay);
  };
  looper();
}

// displays "artist name(s) -track" of to page
function displayTracks(data) {
  // console.log(data);
  let div = document.createElement("div");
  let title = createTitle(data.name);
  div.append(title);
  data.tracks.items.forEach((item) => {
    let track = item.name;
    let uri = item.uri;
    let artist = item.artists.map((artist) => artist.name).join(", ");
    let trackElement = createTrackElement(artist, track, uri);
    div.append(trackElement);
  });

  resultsPage.append(div);

  function createTrackElement(artist, track, uri) {
    let div = document.createElement("div");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("id", uri);
    checkbox.setAttribute("checked", ""); //default checked

    let artistE = document.createElement("span");
    let trackE = document.createElement("span");

    artistE.innerText = artist;
    trackE.innerText = track;

    div.append(checkbox);
    div.append(artistE);
    div.append(trackE);

    return div;
  }

  function createTitle(title) {
    let div = document.createElement("div");
    let toggle = document.createElement("button");
    toggle.innerText = "o";
    toggle.addEventListener("click", (e) => toggleChecked(e));
    let t = document.createElement("span");
    t.innerText = title;
    t.classList.add("album-title");
    div.append(toggle);
    div.append(t);
    return div;

    function toggleChecked(e) {
      let trackdiv = e.target.parentElement.parentElement;
      let tracks = trackdiv.querySelectorAll("input");
      let bool = tracks[0].checked;
      console.log(bool);

      tracks.forEach((box) =>
        bool ? (box.checked = false) : (box.checked = true)
      );
    }
  }
}

function displayAlbumError(query) {
  let error = document.createElement("p");
  error.innerText = `can't find album matching ${query}`;
  error.classList.add("album-error");
  resultsPage.append(error);
}

function displayAlbumQuery(query) {
  let q = document.createElement("p");
  q.innerText = `search was for ${query}`;
  resultsPage.append(q);
}

//unused..:
// function displayAlbum(data) {
//   data.albums.items.forEach((item) => {
//     let album = item.name;
//     let artist = item.artists.map((artist) => artist.name).join(", ");
//     let albumElement = createAlbumElement(artist, album);
//     resultsPage.append(albumElement);
//   });

//   function createAlbumElement(artist, album) {
//     let div = document.createElement("div");
//     let checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     let artistE = document.createElement("span");
//     let albumE = document.createElement("span");

//     artistE.innerText = artist;
//     albumE.innerText = album;

//     div.append(checkbox);
//     div.append(artistE);
//     div.append(albumE);

//     return div;
//   }
// }
// function displayData(data, type) {
//   console.log(data);

//   data[type].items.forEach((item) => {
//     let track = item.name;
//     let artist = item.artists.map((artist) => artist.name).join(", ");
//     // let album = item.album.name;
//     let trackElement = createTrackElement(artist, track, album);
//     resultsPage.append(trackElement);
//   });

//   function createTrackElement(artist, track, album) {
//     let div = document.createElement("div");
//     let checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     let artistE = document.createElement("span");
//     let trackE = document.createElement("span");
//     let albumE = document.createElement("span");

//     artistE.innerText = artist;
//     trackE.innerText = track;
//     albumE.innerText = album;

//     div.append(checkbox);
//     div.append(artistE);
//     div.append(trackE);
//     div.append(albumE);

//     return div;
//   }
// }
