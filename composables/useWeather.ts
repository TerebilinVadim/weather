import axios from 'axios';

export const useWeather = () => {
  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          current: [
            'temperature_2m',
            'weather_code'
          ],
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'sunrise,sunset',
            'precipitation_probability_max'
          ],
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  return { fetchWeatherData };
};