// scrapes url for specific DOM nodes -

const request = require("request");
const cheerio = require("cheerio");
require("dotenv").config();

module.exports = function (url) {
  return new Promise(function (resolve, reject) {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        let ml = scrapeListItems2020(html);
        resolve(ml);
      } else {
        reject(error);
      }
    });
  });
};

// scrapes the text for list items (ARTIST - ALBUM) from 2020 format  (?)

// --- going to need a few more of these for prev years/formats

//

// returns data in form [["artist-album","artist-album","artist-album","artist-album"],["artist-album"],["artist-album"]]
// i.e an array of arrays. the inner arrays currently represent distinct ul elements in the DOM
function scrapeListItems2020(html) {
  console.log("Scraping...");

  const $ = cheerio.load(html);
  let ml = [];
  $("#templateBody")
    .find("ul")
    //creates a subarray for all list items of each ul
    .each((i, el) => {
      let subList = [];
      $(el)
        .find("li")
        .each((i, el) => {
          item = $(el).text();
          subList.push(item);
        });
      subList = subList.map(
        (entry) =>
          entry
            .trim()
            .replace(/\n/g, " ")
            .replace(/\s\s+/g, " ")
            .replace(/\([^)]*\)/g, "") //removes all (record label) data from between brackets
      );
      ml.push(subList);
    });
  console.log("...scraping done");
  return ml;
}
