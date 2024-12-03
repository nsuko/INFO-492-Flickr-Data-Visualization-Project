import flickrapi
import pandas as pd
import seaborn as sns
import numpy as np

# Your API credentials
api_key = '73d221be5e1cc2745319e4a7e39255bd'
api_secret = '541f10a0ea821424'

# Authenticate the Flickr API
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')
flickr.authenticate_via_browser(perms='read')

# Set the bounding box for the US and specify Commons licensing (license ID 7)
# Note: adjust bbox coordinates for more precise filtering if needed
# bbox_us = "-125.0,24.0,-66.9,49.0"  # Westernmost, southernmost, easternmost, northernmost points of the US
license_types = "7"  # Flickr Commons licenses

# Pull data from API with required filters
photos = flickr.photos.search(
    min_upload_date='2020-01-01',
    max_upload_date='2020-12-31',
    has_geo=1,
    extras='geo,tags,date_taken,url_s',
    # bbox=bbox_us,
    license=license_types,
    per_page=500,
    page=1  # Adjust page number for pagination
)

# Convert data into a pandas DataFrame with selected columns
data = pd.DataFrame(photos['photos']['photo']).loc[:, ['id', 'title', 'longitude', 'latitude', 'datetaken', 'tags', 'url_s']]

# Preview dataset
print(data.head())

## converts latitude and longitudes to numbers instead of strings
data['longitude'] = data['longitude'].astype(float)
data['latitude'] = data['latitude'].astype(float)

## How many images were pulled
len(data)

import plotly.graph_objects as go
## Automatically creates coordinates for each image corner based on geo data given
def coords(longitude, latitude):
    return [
        [float(longitude - 3.0), float(latitude + 2.0)], ## Top left
        [float(longitude + 3.0), float(latitude + 2.0)], ## Top right
        [float(longitude + 3.0), float(latitude - 2.0)], ## Bottom right
        [float(longitude - 3.0), float(latitude - 2.0)], ## Bottom right
    ]

## Creates map
fig3 = go.Figure(go.Scattermapbox())
mapbox2 = dict(zoom=2, 
              accesstoken="pk.eyJ1IjoicnlhbnZhY2hlIiwiYSI6ImNtMzlicGE5bTEwY3gyanB0NnRpMjlxYncifQ.l9JCx0KgfP0bFE9ND4NwDw",
              style='carto-darkmatter',  #set here your prefered mapbox style 
              center=dict(
                        lat=43, 
                        lon=-75.5), 
              layers=[]
              )      

for index, row in data.iterrows() :
                   mapbox2['layers'].append(dict(
                            #below ='',    
                            source = row['url_s'], 
                            sourcetype= "image", 
                            coordinates =  coords(row['longitude'], row['latitude'])
                          ))

fig3.update_layout(mapbox=mapbox2,
    mapbox_style="carto-positron",  # Choose a Mapbox style
    mapbox_zoom=2,  # Set the zoom level
    mapbox_center={"lat": 37.0902, "lon": -95.7129},  # Center of the U.S.
    title="U.S. States Boundaries"
)