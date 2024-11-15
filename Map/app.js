document.addEventListener("DOMContentLoaded", function() {
    // Initialize the map with a zoom level appropriate for the entire U.S.
    var map = L.map('map').setView([37, -96], 4);  // Centered on the US, zoom level 4

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
// Create a custom marker icon with a circular thumbnail
var icon = L.divIcon({
    html: `<div style="width: 50px; height: 50px; background-image: url('${photo.url_s}'); background-size: cover; background-position: center; border-radius: 50%; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);"></div>`,
    className: "custom-div-icon",  // Unique class to ensure custom styling is applied
    iconSize: [50, 50],  // Size of the icon
    iconAnchor: [25, 25]  // Center the icon
});

// Create the marker with the custom div icon
var marker = L.marker([lat, lon], { icon: icon });

                    // Create the marker with the custom icon
                    var marker = L.marker([lat, lon], { icon: icon });
            
                    const photoTitle = photo.title;
                    const ownerName = photo.ownername;
                    const imageUrl = photo.url_s;
                    const photoId = photo.id; // Photo ID
                    const userId = photo.user_id; // User ID
            
                    // Generate the link to the photo on Flickr
                    // const flickrLink = `https://www.flickr.com/photos/${userId}/${photoId}`;
            
                    // Customize the popup content to display title, owner name, and the "View on Flickr" link
                    const popupContent = `
                        <div><img src="${imageUrl}" alt="Photo" style="width: 100px; height: auto;"></div>
                        <div><strong>${photoTitle}</strong><br>from ${ownerName}<br>
                    `;
            
                    marker.bindPopup(popupContent);  // Attach the popup to the marker
            
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
