import flickrapi
import pandas as pd
from datetime import datetime
import time

# Your API credentials
api_key = '73d221be5e1cc2745319e4a7e39255bd'
api_secret = '541f10a0ea821424'

# Authenticate the Flickr API
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')
flickr.authenticate_via_browser(perms='read')

# Set parameters for filtering
license_types = "7"  # Flickr Commons licenses
photos_per_year = 1000  # Target photos per year

# List to store results
all_photos = []

start_time = time.time()  # Start time in seconds
print(f"Script started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Loop over each year from 2008 to 2024
for year in range(2008, 2025):
    # Define the start and end dates for the current year
    start_date = datetime(year, 1, 1).strftime('%Y-%m-%d')
    end_date = datetime(year, 12, 31).strftime('%Y-%m-%d')
    
    # Pull data from API for the current year with required filters
    try:
        photos = flickr.photos.search(
            min_upload_date=start_date,
            max_upload_date=end_date,
            has_geo=1,
            extras='geo,tags,date_taken,date_upload,url_s,license,owner_name',
            license=license_types,
            per_page=photos_per_year,
            page=1
        )
        
        # Append photos for this year to the list
        all_photos.extend(photos['photos']['photo'])
    
    except Exception as e:
        print(f"An error occurred for the year {year}: {e}")

    # Check and print the time every 2 minutes
    elapsed_time = time.time() - start_time
    if int(elapsed_time) % 120 < 2:  # Approximate check every 2 minutes
        print(f"Elapsed time: {int(elapsed_time // 60)} minutes. Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Convert data into a pandas DataFrame with selected columns
data = pd.DataFrame(all_photos).loc[:, ['id', 'title', 'longitude', 'latitude', 'datetaken', 'dateupload', 'tags', 'url_s', 'license', 'ownername']]

# Export the DataFrame to a CSV file
data.to_csv('flickr_photos_metadata.csv', index=False)

print("Metadata has been exported to flickr_photos_metadata.csv")

# Total runtime
end_time = time.time()
total_runtime = end_time - start_time
print(f"Script finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total runtime: {int(total_runtime // 60)} minutes and {int(total_runtime % 60)} seconds")
