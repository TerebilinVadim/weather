import axios from 'axios';

export const useLocation = () => {
  const fetchLocationData = async (lat: number, lng: number) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  };

  return { fetchLocationData };
};