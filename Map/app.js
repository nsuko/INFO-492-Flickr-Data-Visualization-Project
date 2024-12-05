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
    var photoCount = document.getElementById("photo-count");

    var visiblePhotos = [];  // Array to hold all visible photos

    // Collapsible intro box functionality
    var toggleIntroButton = document.getElementById("toggle-intro");
    var introContent = document.getElementById("intro-content");

    toggleIntroButton.addEventListener("click", function() {
        if (introContent.style.display === "none") {
            introContent.style.display = "block";
            toggleIntroButton.textContent = "▼";
        } else {
            introContent.style.display = "none";
            toggleIntroButton.textContent = "▲";
        }
    });

    // Function to load and display photos based on the visible bounds
    function loadPhotos() {
        // Get the current map bounds
        var bounds = map.getBounds();

        // Clear existing markers and the photo container
        markers.clearLayers();

        d3.csv("flickr_photos_metadata_yearly.csv").then(function(data) {
            visiblePhotos = [];  // Clear previous photos

            // Loop through each photo in the data
            data.forEach(function(photo) {
                var lat = parseFloat(photo.latitude);
                var lon = parseFloat(photo.longitude);

                if (bounds.contains([lat, lon])) {
                    visiblePhotos.push(photo);

                    var icon = L.divIcon({
                        html: `<div class="circular-marker" style="background-image: url('${photo.url_s}');"></div>`,
                        className: "",
                        iconSize: [50, 50],
                        iconAnchor: [25, 25]
                    });

                    var marker = L.marker([lat, lon], { icon: icon });

                    const popupContent = `
                    <div class="popup-content">
                        <div class="popup-image">
                            <img src="${photo.url_s}" alt="Photo">
                        </div>
                        <div class="popup-caption">
                            <strong>${photo.title}</strong><br>
                            from ${photo.ownername}<br>
                            <a href="https://www.flickr.com/photos/${photo.owner}/${photo.id}/in/commons" target="_blank">Original Page</a>
                        </div>
                    </div>`;
                
                    marker.bindPopup(popupContent, {
                        maxWidth: 400,
                        maxHeight: 600,
                        className: 'custom-popup'
                    });

                    markers.addLayer(marker);
                }
            });

            updatePhotoCount();
            map.addLayer(markers);
            displayVisiblePhotos();
        });
    }

    function updatePhotoCount() {
        const count = visiblePhotos.length;
        photoCount.innerHTML = `${count.toLocaleString()} photos taken here 🔄`;
    }

    function displayVisiblePhotos() {
        photoContainer.innerHTML = '';
        visiblePhotos.slice(0, 80).forEach(function(photo) {
            var photoWrapper = document.createElement("div");
            photoWrapper.className = "photo-wrapper";

            var img = document.createElement("img");
            img.src = photo.url_s;
            img.alt = photo.title;
            img.className = "photo-thumbnail";

            var caption = document.createElement("div");
            caption.className = "photo-caption";
            var limitedTitle = photo.title.length > 20 ? photo.title.substring(0, 20) + "..." : photo.title;

            caption.innerHTML = `${limitedTitle}<br>from ${photo.ownername}`;
            var link = document.createElement("a");
            link.href = `https://www.flickr.com/photos/${photo.owner}/${photo.id}/in/commons`;
            link.className = "photo-caption";
            link.textContent = "Original Page";

            photoWrapper.appendChild(img);
            photoWrapper.appendChild(caption);
            photoWrapper.appendChild(link);

            photoContainer.appendChild(photoWrapper);
        });
    }

    loadPhotos();

    // Adds search ability for places
    const search = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        position: 'top',
        style: 'bar',
        showMarker: false,
        searchLabel: 'Search for a place...'

    });
    map.addControl(search);

    // Reload photos when the map is moved or zoomed
    map.on('moveend', function(event) {
        loadPhotos();
    });

    map.on('geosearch/showlocation', function(event) {
        loadPhotos();  // Load photos based on the new location
    });

    map.on('geosearch/marker/dragend', function(event) {
        loadPhotos();  // Load photos on drag
    });
});
