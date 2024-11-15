document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('map').setView([37, -96], 4);  // Centered on the US, zoom level 4

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add cluster group to hold the markers
    var markers = L.markerClusterGroup();

    // Create the container to display photos below the map
    var photoContainer = document.getElementById("photo-container");
    var photoCount = document.getElementById("photo-count");  // Get the photo count container

    var visiblePhotos = [];  // Array to hold all visible photos

    // Function to load and display photos based on the visible bounds
    function loadPhotos() {
        // Get the current map bounds
        var bounds = map.getBounds();

        // Clear existing markers and the photo container
        markers.clearLayers();
        photoContainer.innerHTML = '';  // Clear the gallery

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
                        iconUrl: photo.url_s,
                        iconSize: [50, 50],
                        iconAnchor: [25, 25],
                        popupAnchor: [0, -25]
                    });
            
                    // Create the marker with the custom icon
                    var marker = L.marker([lat, lon], { icon: icon });
            
                    // Customize the popup content
                    const photoTitle = photo.title;
                    const ownerName = photo.ownername;
                    const imageUrl = photo.url_s;
            
                    const popupContent = `
                        <div><img src="${imageUrl}" alt="Photo" style="width: 100px; height: auto;"></div>
                        <div><strong>${photoTitle}</strong><br>from ${ownerName}<br>
                    `;
            
                    marker.bindPopup(popupContent);
            
                    // Add the marker to the cluster group
                    markers.addLayer(marker);
                }
            });

            // Update the photo count text
            updatePhotoCount();

            // Add the markers to the map
            map.addLayer(markers);

            // Display the thumbnails below the map
            displayVisiblePhotos();
        });
    }

    // Function to update the photo count
    function updatePhotoCount() {
        const count = visiblePhotos.length;
        photoCount.innerHTML = `${count.toLocaleString()} photos taken here 🔄`;
    }

    // Function to display photos below the map
    function displayVisiblePhotos() {
        // Show up to 80 photos in the photo container
        var photosToDisplay = visiblePhotos.slice(0, 80);

        photosToDisplay.forEach(function(photo) {
            var img = document.createElement("img");
            img.src = photo.url_s;
            img.alt = photo.title;
            img.className = "photo-thumbnail";
            photoContainer.appendChild(img);
        });
    }

    // Lazy load more photos as the user scrolls
    var currentIndex = 80;
    photoContainer.addEventListener("scroll", function() {
        if (photoContainer.scrollTop + photoContainer.clientHeight >= photoContainer.scrollHeight) {
            loadMorePhotos();
        }
    });

    // Function to load more photos on scroll
    function loadMorePhotos() {
        var photosToDisplay = visiblePhotos.slice(currentIndex, currentIndex + 20);
        photosToDisplay.forEach(function(photo) {
            var img = document.createElement("img");
            img.src = photo.url_s;
            img.alt = photo.title;
            img.className = "photo-thumbnail";
            photoContainer.appendChild(img);
        });

        currentIndex += 20;
    }

    // Load photos when the map is first loaded
    loadPhotos();

    // Reload photos when the map is moved or zoomed
    map.on('moveend', function() {
        loadPhotos();
    });
});
