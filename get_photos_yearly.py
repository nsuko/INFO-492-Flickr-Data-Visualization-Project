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
photos_per_year = 1000  # Target photos per year (to be adjusted via pagination)
photos_per_page = 250  # Flickr API max per page

# List to store results
all_photos = []

# Start time tracking
start_time = time.time()

# Loop over each year from 2008 to 2024
for year in range(2008, 2025):
    # Define the start and end dates for the current year
    start_date = datetime(year, 1, 1).strftime('%Y-%m-%d')
    end_date = datetime(year, 12, 31).strftime('%Y-%m-%d')
    
    # Initialize the page counter
    page = 1
    year_photos = []
    
    # Pull data from API for the current year with required filters
    while len(year_photos) < photos_per_year:
        try:
            photos = flickr.photos.search(
                min_upload_date=start_date,
                max_upload_date=end_date,
                has_geo=1,
                extras='geo,tags,date_taken,date_upload,url_s,license,owner_name',
                license=license_types,
                per_page=photos_per_page,
                page=page
            )
            
            # Get the list of photos for this page
            year_photos.extend(photos['photos']['photo'])
            print(f"Year {year}, Page {page}: {len(photos['photos']['photo'])} photos retrieved")

            # If the number of photos retrieved meets or exceeds the desired number, stop fetching
            if len(year_photos) >= photos_per_year:
                break

            # Increment the page number for the next iteration
            page += 1
        
        except Exception as e:
            print(f"An error occurred for the year {year}, page {page}: {e}")
            break

    # Append the photos for this year to the overall list
    all_photos.extend(year_photos)
    
    # Print the total number of photos collected for the year
    print(f"Year {year}: {len(year_photos)} photos collected")

    # Print elapsed time every 2 minutes
    elapsed_time = time.time() - start_time
    if int(elapsed_time) % 120 < 2:  # Approximate check every 2 minutes
        print(f"Elapsed time: {int(elapsed_time // 60)} minutes. Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Convert data into a pandas DataFrame with selected columns
data = pd.DataFrame(all_photos).loc[:, ['id', 'owner', 'title', 'longitude', 'latitude', 'datetaken', 'dateupload', 'tags', 'url_s', 'license', 'ownername']]

# Export the DataFrame to a CSV file
data.to_csv('flickr_photos_metadata_yearly.csv', index=False)

# Print the total photo count
total_photos = len(all_photos)
print(f"\nTotal photos across all years: {total_photos} photos")

# Total runtime
end_time = time.time()
total_runtime = end_time - start_time
print(f"Script finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total runtime: {int(total_runtime // 60)} minutes and {int(total_runtime % 60)} seconds")
