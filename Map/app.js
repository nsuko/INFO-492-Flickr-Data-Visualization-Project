document.addEventListener("DOMContentLoaded", function() {
    // Initialize the map with a zoom level appropriate for the entire U.S.
    var map = L.map('map').setView([37.0902, -95.7129], 4);  // Centered on the US, zoom level 4

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add cluster group to hold the markers
    var markers = L.markerClusterGroup();

    // Create the container to display photos below the map
    var photoContainer = document.getElementById("photo-container");

    // Array to hold all visible photos
    var visiblePhotos = [];

    // Function to load and display photos based on the visible bounds
    function loadPhotos() {
        // Get the current map bounds
        var bounds = map.getBounds();

        // Clear existing markers and the photo container
        markers.clearLayers();
        photoContainer.innerHTML = '';

        // Filter photos based on bounds (latitude and longitude)
        d3.csv("data.csv").then(function(data) {
            visiblePhotos = [];  // Clear previous photos

            data.forEach(function(photo) {
                var lat = parseFloat(photo.latitude);
                var lon = parseFloat(photo.longitude);

                // Check if photo is inside the current map bounds
                if (bounds.contains([lat, lon])) {
                    // Add the photo to the visible photos array
                    visiblePhotos.push(photo);

                    // Create a custom marker icon with the thumbnail
                    var icon = L.icon({
                        iconUrl: photo.url_s,  // URL of the thumbnail image
                        iconSize: [50, 50],  // Size of the icon (adjust as needed)
                        iconAnchor: [25, 25],  // Point where the icon is anchored (centered)
                        popupAnchor: [0, -25]  // Where the popup appears (optional)
                    });

                    // Create the marker with the custom icon
                    var marker = L.marker([lat, lon], { icon: icon });

                    // Bind a popup with the title (optional)
                    marker.bindPopup("<b>" + photo.title + "</b>");

                    // Add the marker to the cluster group
                    markers.addLayer(marker);
                }
            });

            // Add the markers to the map
            map.addLayer(markers);

            // Display the thumbnails below the map
            displayVisiblePhotos();
        });
    }

    // Function to display photos below the map
    function displayVisiblePhotos() {
        // Show up to 100 photos in the photo container
        var photosToDisplay = visiblePhotos.slice(0, 100);

        // Append each photo as an image thumbnail in the container
        photosToDisplay.forEach(function(photo) {
            var img = document.createElement("img");
            img.src = photo.url_s;  // Use the thumbnail image URL
            img.alt = photo.title;
            img.className = "photo-thumbnail";  // Apply a class for styling
            photoContainer.appendChild(img);
        });
    }

    // Lazy load more photos as the user scrolls
    var currentIndex = 100;
    photoContainer.addEventListener("scroll", function() {
        if (photoContainer.scrollTop + photoContainer.clientHeight >= photoContainer.scrollHeight) {
            // Load the next set of photos if the user has scrolled to the bottom
            loadMorePhotos();
        }
    });

    // Function to load more photos on scroll
    function loadMorePhotos() {
        // Show up to the next 100 photos
        var photosToDisplay = visiblePhotos.slice(currentIndex, currentIndex + 100);

        photosToDisplay.forEach(function(photo) {
            var img = document.createElement("img");
            img.src = photo.url_s;  // Use the thumbnail image URL
            img.alt = photo.title;
            img.className = "photo-thumbnail";  // Apply a class for styling
            photoContainer.appendChild(img);
        });

        currentIndex += 100;
    }

    // Load photos when the map is first loaded
    loadPhotos();

    // Reload photos when the map is moved or zoomed
    map.on('moveend', function() {
        loadPhotos();
    });
});
