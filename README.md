# FlickrNav: Interactive Photo Map Visualization

**FlickrNav** is a web-based data visualization app that displays geotagged photos from the Flickr API on an interactive map. Built with Leaflet.js, D3.js, and vanilla JavaScript, the app allows users to explore photos by location, view thumbnails, and navigate to the original Flickr pages — all in a smooth, user-friendly interface.

## Technologies Used

- JavaScript
- HTML / CSS
- D3.js for loading and parsing CSV metadata
- Leaflet.js for mapping and marker clusters
- GeoSearch for place search and navigation
- Flickr API (via CSV dataset)

## Key Features

- Display of Flickr photos as circular thumbnails on a dynamic map
- Marker clustering with zoom-based visibility
- Place search powered by OpenStreetMap
- Scrollable thumbnail gallery of visible photos
- Automatic reloading of photos based on map view
- Custom popups with photo previews, titles, owner names, and direct links to original pages
- Live photo counter showing the number of visible photos

## My Contributions

- Designed the layout and interactions for the UI
- Implemented the map logic with Leaflet, clustering, and search
- Built the logic for dynamic loading of visible photos
- Developed lazy loading for thumbnails and reset/map control behavior

## Data

This app uses a dataset of geotagged photo metadata exported from Flickr, stored in CSV format (`flickr_photos_metadata_yearly.csv`), including:
- Latitude and Longitude
- Title
- Owner Name
- Photo URL
- UNIX Upload Date

## How to Run It

1. Clone or download the project repository
2. Open `index.html` in your
3. Make sure the CSV file is in the root directory or update the path in `app.js`

Note: Due to browser security, local file access for CSV might not work unless served via a local server (e.g., Python’s `http.server`, Live Server in VS Code, etc.).

## Credits

- Built by a student team at the University of Washington
- Map powered by Leaflet.js
- Place search via GeoSearch and OpenStreetMap
- Data sourced from Flickr

