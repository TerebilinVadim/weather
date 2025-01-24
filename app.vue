<template lang="pug">
div(class="bg-gray-100 text-gray-900 font-sans min-h-screen flex flex-col")
  Header

  section(class="py-16 px-4 bg-white flex-grow")
    div(id="home" class="max-w-7xl mx-auto text-center")
      div(
        v-if="mapLoading"
        style="height: 50vh"
        class="h-8 bg-slate-200 rounded"
      )
      LMap(
        v-else
        style="height: 450px"
        :zoom="7"
        :center="[coordinates.lat, coordinates.lng]"
        :use-global-leaflet="false"
        @click="updateCoordinates"
      )
        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors" layer-type="base" name="OpenStreetMap"/>
        LMarker(
          v-if="coordinates.lat && coordinates.lng"
          :lat-lng="[coordinates.lat, coordinates.lng]"
        )
      div(class="mt-3 text-blue-600")
        div(
          v-if="locationLoading"
          class="h-20 bg-slate-200 rounded"
        )
        div(v-else)
          div
            h4(class="inline text-4xl") {{ coordinates.country }}
            h4(
              v-if="coordinates.state"
              class="inline text-4xl"
            ) , {{ coordinates.state }}
            h4(
              v-if="coordinates.locality"
              class="inline text-4xl"
            ) , {{ coordinates.locality }}
          div
            h4(class="inline text-4xl") {{ currentWeather.weatherConditions }}
            h4(class="inline text-4xl") , {{ currentWeather.temperature }}°C

  section(id="table" class="py-16")
    div(class="max-w-7xl mx-auto text-center")
      div(class="overflow-x-auto")
        table(class="min-w-full table-auto border-collapse border border-gray-300")
          thead
            tr(class="bg-blue-500 text-white")
              th(class="px-4 py-2 border border-gray-300") Дата
              th(class="px-4 py-2 border border-gray-300") Мин. температура,&nbsp;°C
              th(class="px-4 py-2 border border-gray-300") Макс. температура,&nbsp;°C
              th(class="px-4 py-2 border border-gray-300") Макс. вероятность осадков,&nbsp;%
              th(class="px-4 py-2 border border-gray-300") Самые суровые условия
              th(class="px-4 py-2 border border-gray-300") Время восхода
              th(class="px-4 py-2 border border-gray-300") Время заката
          tbody
            tr(
              v-for="(day, index) in dailyWeather"
              :key="index"
              :class="index % 2 === 0 ? 'bg-gray-100' : 'bg-white'"
              class="text-center"
            )
              td(class="px-4 py-2 border border-gray-300") {{ day.day }}
              td(class="px-4 py-2 border border-gray-300") {{ day.min_temperature }}
              td(class="px-4 py-2 border border-gray-300") {{ day.max_temperature }}
              td(class="px-4 py-2 border border-gray-300") {{ day.max_precipitation_probability }}
              td(class="px-4 py-2 border border-gray-300") {{ day.weather_code }}
              td(class="px-4 py-2 border border-gray-300") {{ day.sunrise }}
              td(class="px-4 py-2 border border-gray-300") {{ day.sunset }}

  Footer
</template>
<script lang="ts">
import { format } from 'date-fns';

import {
  ref,
  reactive,
  onMounted,
} from 'vue';

export default defineComponent({
  components: {
    Header: defineAsyncComponent(() => import('@/components/Header.vue')),
    Footer: defineAsyncComponent(() => import('@/components/Footer.vue')),
  },
  setup() {
    const locationLoading = ref<boolean>(true);

    const mapLoading = ref<boolean>(true);

    const coordinates = reactive({
      lat: 53.242391,
      lng: 34.366389,
      country: '',
      state: '',
      locality: '',
    });

    const currentWeather = reactive({
      temperature: null,
      weatherConditions: null,
    });

    const dailyWeather = ref({});

    const formatDay = (day: string) => {
      const date = new Date(day);
      return format(date, 'dd.MM.yyyy');
    };

    const formatTime = (time: string) => {
      const date = new Date(time);
      return format(date, 'HH:mm');
    };

    const updateCoordinates = (event): void => {
      coordinates.lat = event.latlng.lat;

      coordinates.lng = event.latlng.lng;

      getLocation();

      getWeather();
    };

    const getLocation = async () => {
      locationLoading.value = true;

      const data = await useLocation(coordinates.lat, coordinates.lng);

      coordinates.country = data.address.country;

      coordinates.state = data.address.state;

      coordinates.locality = data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          data.address.municipality ||
          data.address.locality ||
          data.address.suburb ||
          '';

      if (coordinates.state === coordinates.locality) {
        coordinates.state = '';
      }

      locationLoading.value = false;
    };

    const getWeather = async (): Promise<void> => {
      const data = await useWeather(coordinates.lat, coordinates.lng);

      currentWeather.temperature = Math.floor(data.current.temperature_2m);

      currentWeather.weatherConditions = weatherCodeDescriptions[data.current.weather_code];

      if (data.daily) {
        data.daily.time.forEach((day, index) => {
          dailyWeather.value[index] = {
            day: formatDay(data.daily.time[index]),
            min_temperature: Math.floor(data.daily.temperature_2m_min[index]),
            max_temperature: Math.floor(data.daily.temperature_2m_max[index]),
            max_precipitation_probability: data.daily.precipitation_probability_max[index],
            weather_code: weatherCodeDescriptions[data.daily.weather_code[index]],
            sunrise: formatTime(data.daily.sunrise[index]),
            sunset: formatTime(data.daily.sunset[index]),
          };
        });
      }
    };

    const loadMap = async (): Promise<void> => {
      mapLoading.value = true;

      await getWeather();

      mapLoading.value = false;
    };

    onMounted(() => {
      getLocation();
      loadMap();
    });

    return {
      locationLoading,
      mapLoading,
      coordinates,
      currentWeather,
      dailyWeather,
      updateCoordinates
    };
  },
})
</script>

<style scoped>

</style>