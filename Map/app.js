// Initialize the map
var map = L.map('map').setView([37.7749, -122.4194], 5); // Default to US center (San Francisco)

// Add a base map layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch the CSV file
fetch('data.csv')  // Ensure this file is in the correct location or provide an absolute URL if hosted elsewhere
    .then(response => response.text())
    .then(csvData => {
        console.log("CSV data fetched successfully");

        // Parse the CSV data using PapaParse
        Papa.parse(csvData, {
            header: true,  // The first row contains headers
            dynamicTyping: true,  // Automatically convert numbers
            skipEmptyLines: true,  // Skip empty lines
            complete: function(results) {
                console.log("CSV parsed successfully:", results.data);  // Logs the parsed data array

                var photos = results.data;

                // Check if photos array has data
                if (photos.length === 0) {
                    console.warn("No data found in CSV.");
                }

                // Loop through the photos data
                photos.forEach(function(photo) {
                    var lat = parseFloat(photo.latitude);
                    var lon = parseFloat(photo.longitude);
                    var title = photo.title;
                    var url = photo.url_s;

                    // Log each photo's details to confirm data
                    console.log("Processing photo:", { title, lat, lon, url });

                    // Only proceed if lat and lon are valid
                    if (lat && lon) {
                        var photoIcon = L.icon({
                            iconUrl: url,
                            iconSize: [50, 50],  // Resize photo if needed
                            iconAnchor: [25, 25], // Center the icon
                            popupAnchor: [0, -25] // Adjust the popup position
                        });

                        // Create a marker for each photo with its title and location
                        L.marker([lat, lon], { icon: photoIcon })
                            .addTo(map)
                            .bindPopup("<b>" + title + "</b><br><img src='" + url + "' alt='" + title + "' style='width:100px;'>");
                    } else {
                        console.warn("Skipping photo due to invalid coordinates:", photo);
                    }
                });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching the CSV:', error);
    });
