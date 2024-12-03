import flickrapi
import pandas as pd
from datetime import datetime, timedelta
import time

# Your API credentials
api_key = '73d221be5e1cc2745319e4a7e39255bd'
api_secret = '541f10a0ea821424'

# Authenticate the Flickr API
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')
flickr.authenticate_via_browser(perms='read')

# Set parameters for filtering
license_types = "7"  # Flickr Commons licenses
photos_per_month = 10  # Target photos per month

# List to store results and set to track coordinates
all_photos = []
seen_coordinates = set()

# Start date and time tracking
start_date = datetime(2008, 1, 1)
end_date = datetime(2024, 12, 31)
current_date = start_date
start_time = time.time()  # Start time in seconds
print(f"Script started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Loop over each month from 2008 to 2024
while current_date <= end_date:
    # Define the start and end dates for the current month
    next_month = (current_date.replace(day=28) + timedelta(days=4)).replace(day=1)
    
    # Temporary list to store unique photos for the month
    month_photos = []

    try:
        # Pull data from API for the current month with required filters
        photos = flickr.photos.search(
            min_upload_date=current_date.strftime('%Y-%m-%d'),
            max_upload_date=next_month.strftime('%Y-%m-%d'),
            has_geo=1,
            extras='geo,tags,date_taken,date_upload,url_s,license,owner_name',
            license=license_types,
            per_page=500,
            page=1
        )
        
        # Filter for unique coordinates
        for photo in photos['photos']['photo']:
            coordinates = (photo.get('longitude'), photo.get('latitude'))
            if coordinates not in seen_coordinates and len(month_photos) < photos_per_month:
                seen_coordinates.add(coordinates)
                
                # Ensure all expected fields are present
                month_photos.append({
                    'id': photo.get('id'),
                    'title': photo.get('title'),
                    'longitude': photo.get('longitude'),
                    'latitude': photo.get('latitude'),
                    'datetaken': photo.get('datetaken'),
                    'dateupload': photo.get('dateupload'),
                    'tags': photo.get('tags'),
                    'url_s': photo.get('url_s'),
                    'license': photo.get('license'),
                    'ownername': photo.get('ownername')
                })
                
                # Stop if we reach the monthly limit
                if len(month_photos) >= photos_per_month:
                    break

        # Append unique photos for this month to the main list
        all_photos.extend(month_photos)
    
    except Exception as e:
        print(f"An error occurred for the month starting {current_date}: {e}")
    
    # Move to the next month
    current_date = next_month

    # Check and print the time every 2 minutes
    elapsed_time = time.time() - start_time
    if int(elapsed_time) % 120 < 2:  # Approximate check every 2 minutes
        print(f"Elapsed time: {int(elapsed_time // 60)} minutes. Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Convert data into a pandas DataFrame with selected columns
data = pd.DataFrame(all_photos)

# Convert the Unix timestamp in 'dateupload' to a readable date format if present
if 'dateupload' in data.columns:
    data['dateupload'] = pd.to_datetime(data['dateupload'], unit='s', errors='coerce')

# Export the DataFrame to a CSV file
data.to_csv('flickr_photos_metadata2.csv', index=False)

# Total runtime
end_time = time.time()
total_runtime = end_time - start_time
print(f"Script finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total runtime: {int(total_runtime // 60)} minutes and {int(total_runtime % 60)} seconds")
