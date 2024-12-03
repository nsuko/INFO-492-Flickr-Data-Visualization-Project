import flickrapi
import pandas as pd
from datetime import datetime, timedelta

# Your API credentials
api_key = '73d221be5e1cc2745319e4a7e39255bd'
api_secret = '541f10a0ea821424'

# Authenticate the Flickr API
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')
flickr.authenticate_via_browser(perms='read')

# Set parameters for filtering
bbox_us = "-125.0,24.0,-66.9,49.0"  # Bounding box coordinates for the US
license_types = "4,5,6,9"  # Flickr Commons licenses
photos_per_week = 20  # Target photos per week

# List to store results
all_photos = []

# Loop over each week from 2008 to 2024
start_date = datetime(2008, 1, 1)
end_date = datetime(2024, 12, 31)
current_date = start_date

while current_date <= end_date:
    next_week = current_date + timedelta(days=7)
    
    # Pull data from API for the current week with required filters
    try:
        photos = flickr.photos.search(
            min_upload_date=current_date.strftime('%Y-%m-%d'),
            max_upload_date=next_week.strftime('%Y-%m-%d'),
            has_geo=1,
            extras='geo,tags,date_taken,date_upload,url_s,license,owner_name',
            bbox=bbox_us,
            license=license_types,
            per_page=photos_per_week,
            page=1
        )
        
        # Append photos for this week to the list
        all_photos.extend(photos['photos']['photo'])
    
    except Exception as e:
        print(f"An error occurred for the week starting {current_date}: {e}")
    
    # Move to the next week
    current_date = next_week

# Convert data into a pandas DataFrame with selected columns
data = pd.DataFrame(all_photos).loc[:, ['id', 'title', 'longitude', 'latitude', 'datetaken', 'dateupload', 'tags', 'url_s', 'license', 'ownername']]

# Export the DataFrame to a CSV file
data.to_csv('flickr_photos_metadata.csv', index=False)

print("Metadata has been exported to flickr_photos_metadata.csv")
