<template>
    <GoogleMap ref="googleMap" :api-key="mapsKey" :zoom="15" :center="center" @click="placeMarker" style="width: 75%; height: 400px; border-radius: 1rem; overflow: hidden; border-width: 2px; border-color: #834848">
        <Marker v-if="markerVisible" :options="markerOptions"/>
        <CustomControl position="BOTTOM_CENTER">
            <button type="button" @click="centerLocation" class="box-border bg-white h-10 w-auto rounded-sm border-0 m-4 px-4 text-xl font-medium normal-case appearance-none select-none overflow-hidden shadow-[0_1px_4px_-1px_rgba(0,0,0,0.3)] hover:bg-gray-200"> Recenter </button>
        </CustomControl>
    </GoogleMap>
</template>

<script>
    import { defineComponent, ref, onMounted } from 'vue';
    import { GoogleMap, Marker, CustomControl } from 'vue3-google-map';
    import config from '@/config';

    export default defineComponent({
        name: 'InputMap',
        components: {
            GoogleMap,
            Marker,
            CustomControl,
        },
        setup(){
            const center = ref({ lat: 34.413963, lng: -119.848946 });
            const mapsKey = config.mapsKey;
            onMounted(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    // Update the reactive center value
                    center.value = userLocation;
                    });
                }
            });
            return {
                mapsKey,
                center,
            };
        },
        data() {
            return {
                markerVisible: false,
                markerOptions: {
                    position: { lat: 34.413963, lng: -119.848946 },
                    draggable: true,
                    visible: true,
                },
            };
        },
        methods: {
            centerLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const newCenter = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        // Update the center prop for consistency if needed
                        this.center.value = newCenter;
                        // Use the Google Maps API to recenter the map
                        if (this.$refs.googleMap && this.$refs.googleMap.map) {
                            this.$refs.googleMap.map.setCenter(newCenter);
                        }
                    });
                }
            },
            placeMarker(e) {
                this.markerVisible = true;
                const newPos = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                this.markerOptions = { ...this.markerOptions, position: newPos };
                this.$emit('updateLatLng', newPos);
            }
        },
    });
</script>
