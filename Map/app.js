document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('map').setView([37, -96], 4);  // Centered on the US, zoom level 4

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add cluster group to hold the markers
    var markers = L.markerClusterGroup({
        disableClusteringAtZoom: 10 // This will prevent clustering at zoom level 10 and higher
    });
    map.addLayer(markers);

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

        // Filter photos based on bounds (latitude and longitude)
        d3.csv("flickr_photos_metadata_yearly.csv").then(function(data) {
            visiblePhotos = [];  // Clear previous photos

            // Loop through each photo in the data
            data.forEach(function(photo) {
                var lat = parseFloat(photo.latitude);
                var lon = parseFloat(photo.longitude);

                // Check if photo is inside the current map bounds
                if (bounds.contains([lat, lon])) {
                    // Add the photo to the visible photos array
                    visiblePhotos.push(photo);

                    // Create a custom marker icon with the thumbnail
                    var icon = L.divIcon({
                        html: `<div class="circular-marker" style="background-image: url('${photo.url_s}');"></div>`,
                        className: "",  // Clear default class to avoid unwanted styles
                        iconSize: [50, 50],  // Size of the icon (adjust as needed)
                        iconAnchor: [25, 25]  // Center the icon
                    });

                    // Create the marker with the custom icon
                    var marker = L.marker([lat, lon], { icon: icon });

                    // Customize the popup content
                    const photoTitle = photo.title;
                    const ownerName = photo.ownername;
                    const imageUrl = photo.url_s;
                    const dateUploaded = photo.dateupload ? new Date(photo.dateupload * 1000).toLocaleDateString() : "No date available"; // Assuming dateupload is a UNIX timestamp
                    const flickrUrl = `https://www.flickr.com/photos/${photo.owner}/${photo.id}/in/commons`;
                    const popupContent = `
                    <div class="popup-content">
                        <div class="popup-image">
                            <img src="${imageUrl}" alt="Photo">
                        </div>
                        <div class="popup-caption">
                            <strong>${photoTitle}</strong><br>
                            from ${ownerName}<br>
                            <strong>Date:</strong> ${dateUploaded}<br>
                            <a href=${flickrUrl} target="_blank"><strong>Original Page</strong><a> <br>
                        </div>
                    </div>
                `;
                
                marker.bindPopup(popupContent, {
                    maxWidth: 400,  // Adjust max width of the popup
                    maxHeight: 600, // Adjust max height of the popup
                    className: 'custom-popup' // Optional: custom class for further styling
                });
                

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
        // Clear the existing thumbnails
        photoContainer.innerHTML = '';

        // Show up to 80 photos in the photo container
        var photosToDisplay = visiblePhotos.slice(0, 80);  // Limit to 80 photos

        photosToDisplay.forEach(function(photo) {
            var photoWrapper = document.createElement("div");
            photoWrapper.className = "photo-wrapper";

            // Create the image element
            var img = document.createElement("img");
            img.src = photo.url_s;
            img.alt = photo.title;
            img.className = "photo-thumbnail";

            // Create the caption div
            var caption = document.createElement("div");
            caption.className = "photo-caption";

            // Limit the title length to 20 characters and add "..." if needed
            var limitedTitle = photo.title.length > 20 ? photo.title.substring(0, 20) + "..." : photo.title;

            // Set the caption with title and owner name
            caption.innerHTML = `${limitedTitle}<br>from ${photo.ownername}`;

            // Set the url to the original Flickr image page
            var link = document.createElement("a");
            link.href = `https://www.flickr.com/photos/${photo.owner}/${photo.id}/in/commons`;
            link.className = "photo-caption";
            link.textContent = "Original Page";

            // Append the image, caption, and url to the wrapper
            photoWrapper.appendChild(img);
            photoWrapper.appendChild(caption);
            photoWrapper.appendChild(link);

            // Append the wrapper to the photo container
            photoContainer.appendChild(photoWrapper);
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
        var photosToDisplay = visiblePhotos.slice(currentIndex, currentIndex + 20);  // Load 20 photos

        photosToDisplay.forEach(function(photo) {
            var photoWrapper = document.createElement("div");
            photoWrapper.className = "photo-wrapper";

            // Create the image element
            var img = document.createElement("img");
            img.src = photo.url_s;
            img.alt = photo.title;
            img.className = "photo-thumbnail";

            // Create the caption div
            var caption = document.createElement("div");
            caption.className = "photo-caption";

            // Limit the title length to 20 characters and add "..." if needed
            var limitedTitle = photo.title.length > 20 ? photo.title.substring(0, 20) + "..." : photo.title;

            // Set the caption with title and owner name
            caption.innerHTML = `${limitedTitle}<br>from ${photo.ownername}`;

            // Set the url to the original Flickr image page
            var link = document.createElement("a");
            link.href = `https://www.flickr.com/photos/${photo.owner}/${photo.id}/in/commons`;
            link.className = "photo-caption";
            link.textContent = "Original Page";

            // Append the image and caption to the wrapper
            photoWrapper.appendChild(img);
            photoWrapper.appendChild(caption);
            photoWrapper.appendChild(link);

            // Append the wrapper to the photo container
            photoContainer.appendChild(photoWrapper);
        });

        // Update the currentIndex to reflect the next set of photos
        currentIndex += 20;
    }

    // Load photos when the map is first loaded
    loadPhotos();

    // Reload photos when the map is moved or zoomed
    map.on('moveend', function() {
        loadPhotos();
    });
});
