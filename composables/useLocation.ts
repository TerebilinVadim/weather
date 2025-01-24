export const useLocation = async (lat: number, lng: number) => {
  return $fetch('https://nominatim.openstreetmap.org/reverse', {
    params: {
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: 1,
    },
  },
    {
      watch: [lat, lng],
    }
  )
};