const express = require("express");
const path = require("path");

require("dotenv").config();
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const scraper = require("./utils/scraper");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const redirect_uri = "http://localhost:3000/callback";
app.listen(process.env.PORT || PORT);
console.log(`listening on port ${PORT}`);

// https://us1.campaign-archive.com/?u=a2fea4b1d026124fe8c3d151b&id=f79bc2c95e

app.post("/scrapethis", async (req, res) => {
  // console.log(req.body);
  // res.json({ success: true, body: req.body });
  try {
    let musicList = await scraper(req.body.url);
    console.log(musicList);
    res.json({ data: musicList });
  } catch (e) {
    console.log(e);
  }
});
