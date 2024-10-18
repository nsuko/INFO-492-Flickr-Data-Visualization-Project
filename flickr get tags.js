const API_KEY = '73d221be5e1cc2745319e4a7e39255bd';

// Example output from flickr.photos.search
const photoList = [
    { id: '50779821838', owner: '146348843@N05', secret: 'ee050db66f', server: '65535', farm: 66, title: 'Snow Day.', ispublic: 1, isfriend: 0, isfamily: 0 },
    { id: '50780691382', owner: '168700022@N02', secret: 'b22bcfc758', server: '65535', farm: 66, title: 'Roe deer', ispublic: 1, isfriend: 0, isfamily: 0 },
    { id: '50779820003', owner: '168700022@N02', secret: '5497bae22a', server: '65535', farm: 66, title: 'Roe deer', ispublic: 1, isfriend: 0, isfamily: 0 }
  ];
  
  // Function to get detailed info for each photo
  async function getPhotoDetails(photoId) {
      const url = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${API_KEY}&photo_id=${photoId}&format=json&nojsoncallback=1`;
      
      try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.photo) {
              const { title, location, tags } = data.photo;
              return {
                  id: photoId,
                  title: title._content,
                  location: location ? {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      accuracy: location.accuracy
                  } : 'No location data',
                  tags: tags.tag.map(tag => tag.raw)
              };
          } else {
              console.error('Error in photo details:', data);
              return null;
          }
      } catch (error) {
          console.error('Error fetching photo details:', error);
          return null;
      }
  }
  
  // Function to loop through the photos and get details
  async function fetchPhotoDetails(photoList) {
      const photoDetails = [];
      for (let photo of photoList) {
          const details = await getPhotoDetails(photo.id);
          if (details) {
              photoDetails.push(details);
          }
      }
      console.log('Photo Details with Location and Tags:', photoDetails);
  }
  
  // Example call to fetch details for the given photoList
  fetchPhotoDetails(photoList);
  