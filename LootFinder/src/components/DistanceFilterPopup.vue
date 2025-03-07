<template>
  <div>
    <!-- Filter by Distance Button -->
    <button
      @click="showPopup = true"
      class="w-full sm:w-auto p-2 bg-[#ea7643] text-white rounded shadow hover:bg-[#eb8e65] transition"
    >
      Filter by Distance
    </button>
    <!-- Popup Modal -->
    <div
      v-if="showPopup"
      class="fixed inset-0 z-50 flex justify-center items-center"
    >
      <!-- Background Overlay -->
      <div
        class="opacity-25 fixed inset-0 z-40 bg-black"
        @click="showPopup = false"
      ></div>
      <!-- Popup Content - Increased width significantly -->
      <div
        class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4 z-50"
        @click.stop
      >
        <h3 class="text-xl font-bold mb-4">Filter by Distance</h3>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Location
          </label>
          <InputMap @updateLatLng="updateLocation" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Radius (km)
          </label>
          <input
            type="number"
            v-model.number="localRadius"
            placeholder="Distance in km"
            class="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div class="flex justify-between">
          <button
            @click="applyFilter"
            class="px-4 py-2 bg-[#ea7643] text-white rounded shadow hover:bg-[#eb8e65] transition"
          >
            Apply
          </button>
          <button
            @click="clearFilter"
            class="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
          >
            Clear
          </button>
          <button
            @click="showPopup = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import InputMap from '@/components/InputMap.vue';
  export default {
    name: 'DistanceFilterPopup',
    components: {
      InputMap,
    },
    props: {
      currentRadius: {
        type: Number,
        default: null,
      },
      currentLocation: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        showPopup: false,
        localLocation: this.currentLocation,
        localRadius: this.currentRadius,
      };
    },
    watch: {
      currentRadius(newVal) {
        this.localRadius = newVal;
      },
      currentLocation(newVal) {
        this.localLocation = newVal;
      },
    },
    methods: {
      updateLocation(newLocation) {
        this.localLocation = newLocation;
      },
      applyFilter() {
        this.$emit('update-filter', {
          location: this.localLocation,
          radius: this.localRadius,
        });
        this.showPopup = false;
      },
      clearFilter() {
        this.localLocation = null;
        this.localRadius = null;
        this.$emit('update-filter', {
          location: null,
          radius: null,
        });
        this.showPopup = false;
      },
    },
  };
</script>
