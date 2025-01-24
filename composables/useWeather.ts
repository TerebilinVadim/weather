export const useWeather = async (lat: number, lng: number) => {
  return $fetch('https://api.open-meteo.com/v1/forecast', {
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
};