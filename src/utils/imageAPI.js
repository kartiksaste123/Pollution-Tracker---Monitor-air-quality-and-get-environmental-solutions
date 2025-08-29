import axios from 'axios';

const PEXELS_API_KEY = 'M39VyOyM6MSDxy22oi1vhrW7qt7RevfmlBdC056HctfLnx97132V4fXv';

export const getCityImages = async (locationName, aqi) => {
    try {
        // Get location-specific images
        const locationResponse = await axios.get(
            `https://api.pexels.com/v1/search?query=${locationName}+india+landmark&per_page=3&orientation=landscape&locale=en-IN`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            }
        );

        // Get weather-related images based on current conditions
        const weatherResponse = await axios.get(
            `https://api.pexels.com/v1/search?query=${locationName}+weather+india&per_page=2&orientation=landscape`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            }
        );

        // Get air quality related images based on AQI level
        const aqiKeywords = getAQIKeywords(aqi);
        const aqiResponse = await axios.get(
            `https://api.pexels.com/v1/search?query=${aqiKeywords}&per_page=2&orientation=landscape`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            }
        );

        // Process and combine the images
        const locationImages = locationResponse.data.photos.map(photo => ({
            id: photo.id,
            description: `${locationName} - ${photo.alt || 'Location View'}`,
            photographer: photo.photographer,
            url: photo.src.large2x,
            thumbnail: photo.src.medium,
            originalUrl: photo.url,
            type: 'location'
        }));

        const weatherImages = weatherResponse.data.photos.map(photo => ({
            id: photo.id,
            description: `${locationName} Weather - ${photo.alt || 'Current Weather'}`,
            photographer: photo.photographer,
            url: photo.src.large2x,
            thumbnail: photo.src.medium,
            originalUrl: photo.url,
            type: 'weather'
        }));

        const aqiImages = aqiResponse.data.photos.map(photo => ({
            id: photo.id,
            description: `Air Quality Impact - ${photo.alt || getAQIDescription(aqi)}`,
            photographer: photo.photographer,
            url: photo.src.large2x,
            thumbnail: photo.src.medium,
            originalUrl: photo.url,
            type: 'aqi'
        }));

        // Filter out any images that don't match our criteria
        const filteredLocationImages = locationImages.filter(img => 
            img.description.toLowerCase().includes(locationName.toLowerCase()) ||
            img.description.toLowerCase().includes('india')
        );

        // Combine all images
        return [...filteredLocationImages, ...weatherImages, ...aqiImages];
    } catch (error) {
        console.error('Error fetching images from Pexels:', error);
        return [];
    }
};

const getAQIKeywords = (aqi) => {
    if (aqi <= 50) {
        return 'clean+air+blue+sky+fresh+environment+india';
    } else if (aqi <= 100) {
        return 'moderate+air+quality+city+environment+india';
    } else if (aqi <= 150) {
        return 'air+pollution+smog+mask+protection+india';
    } else if (aqi <= 200) {
        return 'heavy+pollution+smog+air+mask+india';
    } else if (aqi <= 300) {
        return 'severe+air+pollution+smog+protection+india';
    } else {
        return 'hazardous+air+pollution+emergency+mask+india';
    }
};

const getAQIDescription = (aqi) => {
    if (aqi <= 50) {
        return 'Clean Air and Clear Skies';
    } else if (aqi <= 100) {
        return 'Moderate Air Quality';
    } else if (aqi <= 150) {
        return 'Unhealthy Air Quality - Protection Needed';
    } else if (aqi <= 200) {
        return 'Unhealthy Air Conditions';
    } else if (aqi <= 300) {
        return 'Very Unhealthy Air Quality';
    } else {
        return 'Hazardous Air Quality Conditions';
    }
}; 