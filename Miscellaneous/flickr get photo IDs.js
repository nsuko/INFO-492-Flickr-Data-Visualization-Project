// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=73d221be5e1cc2745319e4a7e39255bd&tags=landscape&min_upload_date=2005-01-01&max_upload_date=2024-12-31&format=json&nojsoncallback=1

const API_KEY = '73d221be5e1cc2745319e4a7e39255bd';
const BASE_URL = 'https://api.flickr.com/services/rest/';

async function getFlickrData(tag, minUploadDate, maxUploadDate) {
    const url = `${BASE_URL}?method=flickr.photos.search&api_key=${API_KEY}&tags=${tag}&min_upload_date=${minUploadDate}&max_upload_date=${maxUploadDate}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.photos) {
            console.log('Total Photos:', data.photos.total);
            console.log('Photos List:', data.photos.photo);
        } else {
            console.error('Error in response:', data);
        }
    } catch (error) {
        console.error('Error fetching Flickr data:', error);
    }
}

// Example call: Get landscape photos from 2020-01-01 to 2020-12-31
const minDate = new Date('2020-01-01').getTime() / 1000;  // Convert to Unix timestamp
const maxDate = new Date('2020-12-31').getTime() / 1000;  // Convert to Unix timestamp

getFlickrData('landscape', minDate, maxDate);
