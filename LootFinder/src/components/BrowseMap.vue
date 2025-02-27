<template>
  <GoogleMap
    :api-key="mapsKey"
    :zoom="15"
    :center="center"
    style="
      width: 75%;
      height: 400px;
      border-radius: 1rem;
      overflow: hidden;
      border-width: 2px;
      border-color: #834848;
    "
  >
    <Marker
      v-for="(offer, index) in validOffers"
      :key="index"
      :options="{
        position: { lat: offer.latitude, lng: offer.longitude },
        draggable: false,
      }"
      @click="handleMarkerClick(offer)"
    />
  </GoogleMap>
</template>

<script>
  import { defineComponent, ref, watch, computed } from 'vue';
  import { GoogleMap, Marker } from 'vue3-google-map';
  import config from '@/config';

  export default defineComponent({
    name: 'BrowseMap',
    components: {
      GoogleMap,
      Marker,
    },
    props: {
      filteredOffers: {
        type: Array,
        required: true,
      },
    },
    setup(props, { emit }) {
      const mapsKey = config.mapsKey;
      const center = ref({ lat: 34.413963, lng: -119.848946 });

      // ✅ Computed: Filter out offers with invalid lat/lng
      const validOffers = computed(() => {
        return props.filteredOffers.filter(
          (offer) =>
            offer &&
            typeof offer.latitude === 'number' &&
            typeof offer.longitude === 'number' &&
            !isNaN(offer.latitude) &&
            !isNaN(offer.longitude)
        );
      });

      const handleMarkerClick = (offer) => {
        if (
          typeof offer.latitude === 'number' &&
          typeof offer.longitude === 'number'
        ) {
          center.value = { lat: offer.latitude, lng: offer.longitude };
          emit('marker-clicked', offer);
        } else {
          console.warn('Invalid coordinates for clicked offer:', offer);
        }
      };

      // ✅ Watch: Update center only if first valid offer changes
      watch(
        () => validOffers.value[0],
        (firstOffer) => {
          if (firstOffer) {
            console.log('Updating center to:', firstOffer);
            center.value = {
              lat: firstOffer.latitude,
              lng: firstOffer.longitude,
            };
          }
        },
        { immediate: true }
      );

      return {
        mapsKey,
        center,
        validOffers, // Use this in template instead of `filteredOffers`
        handleMarkerClick,
      };
    },
  });
</script>
