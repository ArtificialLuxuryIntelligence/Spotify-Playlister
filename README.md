# Spotify-Playlister
Server scrapes URL for relevant artist/album data. Client selects tracks and creates Spotify playlist.


## What it does
The page was built with a very specific function in mind: to scrape music data from the WFMU music archives.

It is a web application that scrapes certain webpages for albums and returns all tracks included in these albums and that are listed on Spotify .

The user (logged in to Spotify) can then create private playlists and easily add any or all of this music.


## How it does it

The webapp is currently set up to run on a local node server.
The server uses the packages 'request' and 'cheerio' to scrape data from a target URL. The location of the data in the DOM that we want returned to the user is obviously page dependent and can be selected using JQuery (cheerio's choice) in the /utils/scraper.js file. I am building custom functions for the various types of page I need to extract data from.
The clientside deals with all Spotify authentication (using implicit grant flow with the Spotify API) and the user can then create playlists and add songs from the returned scraped music lists.

## Why?

The motivation for building this app is twofold: 

1. Generate a huge playlist of amazing music and possibly help an organisation I admire. (the website the data is from is a freeform, volunteer run organisation and I intend to reach out to them to give them this as a free cataloguing service which may make their current life a bit easier)

2. Practice.  
    - Authorization and API calls using the Spotify API
    - Webscraping with cheerio and thus a bit of JQuery
    - General vanilla javascript data and DOM manipulation
