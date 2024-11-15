// Ensure D3 library is included in your HTML to use d3.csv for loading CSV data
// <script src="https://d3js.org/d3.v7.min.js"></script>

// Initialize the map
var map = L.map('map').setView([37.8, -96], 4);

// Add a tile layer to the map (using OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Minimum zoom level to display individual photo thumbnails
const minZoomForPhotos = 8;

// Create a marker cluster group with custom styling
var markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        var size = 'marker-cluster-small';
        if (count >= 100) {
            size = 'marker-cluster-large';
        } else if (count >= 50) {
            size = 'marker-cluster-medium';
        }
        return L.divIcon({
            html: `<span>${count}</span>`,
            className: `marker-cluster ${size}`,
            iconSize: L.point(40, 40)
        });
    }
});

// Function to create an individual photo marker
function createPhotoMarker(photo) {
    return L.marker([photo.latitude, photo.longitude], {
        icon: L.divIcon({
            html: `<img src="${photo.url_s}" alt="${photo.title}" class="photo-marker">`,
            className: 'photo-marker-icon',
            iconSize: [50, 50]
        })
    });
}

// Load the data from the CSV file using D3
d3.csv("data.csv").then(data => {
    // Process data and create markers
    data.forEach(photo => {
        const latitude = parseFloat(photo.latitude);
        const longitude = parseFloat(photo.longitude);

        if (map.getZoom() >= minZoomForPhotos) {
            // When zoomed in, create photo markers directly on the map
            const photoMarker = createPhotoMarker(photo);
            photoMarker.addTo(map);
        } else {
            // Otherwise, create regular markers for clustering
            const marker = L.marker([latitude, longitude]);
            markers.addLayer(marker);
        }
    });

    // Add the cluster markers to the map
    map.addLayer(markers);

    // Update markers on zoom change
    map.on('zoomend', function() {
        if (map.getZoom() >= minZoomForPhotos) {
            markers.clearLayers(); // Clear cluster markers
            data.forEach(photo => {
                const photoMarker = createPhotoMarker(photo);
                photoMarker.addTo(map); // Add photo marker directly to map
            });
        } else {
            map.eachLayer(layer => {
                if (layer.options && layer.options.icon && layer.options.icon.options.className === 'photo-marker-icon') {
                    map.removeLayer(layer); // Remove individual photo markers when zoomed out
                }
            });
            data.forEach(photo => {
                const marker = L.marker([parseFloat(photo.latitude), parseFloat(photo.longitude)]);
                markers.addLayer(marker); // Add regular marker to clusters
            });
            map.addLayer(markers);
        }
    });
}).catch(error => {
    console.error("Error loading or parsing CSV:", error);
});
