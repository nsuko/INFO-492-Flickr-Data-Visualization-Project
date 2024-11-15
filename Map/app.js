document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map
    const map = L.map("map").setView([39.8283, -98.5795], 4);  // Center on the US

    // Add a base layer (like OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    
    // Load data from CSV
    fetch("data.csv")
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true }).data;

            data.forEach(row => {
                if (row.latitude && row.longitude && row.url_s) {
                    const marker = L.marker([parseFloat(row.latitude), parseFloat(row.longitude)]);

                    // Bind a popup to show the photo
                    marker.bindPopup(`<img src="${row.url_s}" alt="Flickr photo" width="200">`);

                    // Add marker to the cluster group
                    markers.addLayer(marker);
                }
            });

            // Add the marker cluster group to the map
            map.addLayer(markers);
        })
        .catch(error => console.error("Error loading data:", error));

        // Initialize the MarkerCluster group
    // Create a marker cluster group with custom styles
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

    // Add markers to the cluster group and add the cluster group to the map
    markers.addTo(map);
});
