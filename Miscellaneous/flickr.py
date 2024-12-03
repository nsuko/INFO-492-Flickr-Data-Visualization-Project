import flickrapi
import random
from collections import Counter
from datetime import datetime, timedelta

# Add your Flickr API credentials here
API_KEY = '73d221be5e1cc2745319e4a7e39255bd'
API_SECRET = '541f10a0ea821424'

# Set up the Flickr API client
flickr = flickrapi.FlickrAPI(API_KEY, API_SECRET, format='parsed-json')

# Function to get a random sample of photos for a specific year
def get_random_sample_tags(year, num_samples=30):
    tags_counter = Counter()
    
    # Generate all days in the year
    start_date = datetime(2010, 1, 1)
    end_date = datetime(2023, 12, 31)
    all_days = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range((end_date - start_date).days + 1)]
    
    # Randomly select days for sampling
    sampled_days = random.sample(all_days, min(num_samples, len(all_days)))  # Ensure we don't sample more than available days
    
    for day in sampled_days:
        try:
            # Fetch photos for the selected day
            photos = flickr.photos.search(min_taken_date=day, max_taken_date=day, extras="tags", per_page=100, page=1)
            total_photos = photos['photos']['total']
            # Calculate how many pages we can sample from
            if total_photos > 0:
                num_pages = min((total_photos // 100) + 1, 10)  # Limit to 10 pages max for practicality
                random_page = random.randint(1, num_pages)  # Get a random page number
                
                # Fetch the photos from the random page
                random_photos = flickr.photos.search(min_taken_date=day, max_taken_date=day, extras="tags", per_page=100, page=random_page)
                
                # Count tags from the fetched photos
                for photo in random_photos['photos']['photo']:
                    tags = photo['tags'].split()  # Tags are space-separated
                    tags_counter.update(tags)
                    
        except Exception as e:
            print(f"Error fetching data for {day} {year}: {e}")
    
    # Get the most common tag
    if tags_counter:
        most_common_tag, _ = tags_counter.most_common(1)[0]
        return most_common_tag
    else:
        return None

# Loop through each year and print the most popular tag
start_year = 2000
end_year = datetime.now().year

popular_tags = {}
for year in range(start_year, end_year + 1):
    tag = get_random_sample_tags(year)
    popular_tags[year] = tag
    print(f"{year}: {tag}")

# Output all results
print("Most popular tags by year:", popular_tags)
