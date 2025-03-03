<template>
  <div
    class="form-container mx-auto p-6 rounded-2xl shadow-lg border-border border-2"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- ************************** Image ********************************* -->
      <div class="flex flex-col items-center">
        <div
          @dragenter.prevent="toggleActive"
          @dragleave.prevent="toggleActive"
          @dragover.prevent
          @drop.prevent="
            (event) => {
              toggleActive();
              handleDrop(event);
            }
          "
          :class="[
            'flex flex-col justify-center items-center border-2 border-dashed w-11/12 rounded-2xl ease-in',
            {
              'bg-textPrimary': active,
              'bg-lightbackground': !active,
              'border-border': !active,
              'border-lightbackground': active,
            },
          ]"
        >
          <span
            :class="[
              'py-1 font-semibold mt-3',
              { 'text-border': !active, 'text-lightbackground': active },
            ]"
          >
            Drag and Drop Image
          </span>
          <span
            :class="[
              'text-m font-semibold my-1',
              { 'text-border': !active, 'text-lightbackground': active },
            ]"
          >
            Or
          </span>
          <label
            for="image"
            :class="[
              'mt-1 font-semibold mb-3 rounded-xl py-1 px-4',
              {
                'text-textPrimary': active,
                'text-lightbackground': !active,
                'bg-border': !active,
                'bg-lightbackground': active,
              },
            ]"
          >
            Select Image
          </label>
          <input type="file" id="image" class="hidden" @change="handleFileUpload"/>
          <span v-if="fileName" class="my-1 text-sm text-border">{{ fileName }}</span>
        </div>
        <span v-if="imageError" class="text-red-500 text-sm">{{ imageError}}</span>
      </div>
      <!-- ************************** Title ********************************* -->
      <div class="flex flex-col items-center">
        <label
          for="title"
          class="text-center block text-l font-medium text-textPrimary"
        >
          Title
        </label>
        <span v-if="titleError" class="text-red-500 text-sm">{{ titleError }}</span>
        <input
          type="text"
          id="title"
          v-model="form.title"
          class="text-center text-textBody mt-1 block w-11/12 py-2 border-border border-2 rounded-xl shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <!-- **************************** Description ********************************* -->
      <div class="flex flex-col items-center">
        <label
          for="description"
          class="text-center block text-m font-medium text-textPrimary"
        >
          Give a Description
        </label>
        <span v-if="descriptionError" class="text-red-500 text-sm">{{ descriptionError }}</span>
        <textarea
          id="description"
          v-model="form.description"
          class="text-center text-textBody mt-1 block w-11/12 h-24 py-2 border-border border-2 rounded-xl shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>
      <!-- ************************** Location ********************************* -->
      <div class="flex flex-col items-center">
        <label
          class="text-center block text-m mb-1 font-medium text-textPrimary"
        >
          Choose a Location
        </label>
        <span v-if="locationError" class="text-red-500 text-sm mb-1">
          {{ locationError }}
        </span>
        <InputMap @updateLatLng="updateLocation" />
      </div>
      <!-- ************************** Price ********************************* -->
      <div class="flex items-center justify-center">
        <label
          for="price"
          class="text-center block text-xl font-medium text-textPrimary pr-1"
        >
          $
        </label>
        <input
          type="number"
          id="price"
          v-model="form.price"
          class="text-border t-1 block w-16 border-border border-2 pl-2 mr-2 rounded-xl shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <!-- ************************** Price Negotiable ********************************* -->
        <label
          for="negotiable"
          class="text-center mr-2 text-m font-medium text-border"
        >
          Negotiable?
        </label>
        <input
          type="checkbox"
          id="negotiable"
          v-model="form.negotiable"
          class="border-border"
        />
      </div>
      <div class="flex items-center justify-center">
          <span v-if="priceError" class="text-red-500 text-sm">{{ priceError }}</span>
      </div>
      <!-- ************************** Cancel/Submit ********************************* -->
      <div class="flex justify-center">
        <button
          type="button"
          @click="cancel"
          class="px-4 py-2 bg-gray-200 text-textBody rounded-2xl font-semibold hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="ml-2 px-4 py-2 bg-border text-white rounded-2xl font-semibold hover:bg-nav"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script>
  import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    writeBatch,
    doc,
    GeoPoint,
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, storage } from '@/firebase';
  import { getAuth } from 'firebase/auth';
  import InputMap from '@/components/InputMap.vue';
  import { geohashForLocation } from 'geofire-common';
  import { ref as vueRef } from 'vue';
  export default {
    name: 'OfferForm',
    components: {
      InputMap,
    },
    setup() {
      const active = vueRef(false);
      const fileName = vueRef('');
      const locationError = vueRef('');
      const titleError = vueRef('');
      const descriptionError = vueRef('');
      const priceError = vueRef('');
      const imageError = vueRef('');
      const toggleActive = () => {
        active.value = !active.value;
      };
      return {
        active,
        fileName,
        locationError,
        titleError,
        descriptionError,
        priceError,
        imageError,
        toggleActive,
      };
    },
    data() {
      return {
        form: {
          title: '',
          description: '',
          latitude: null,
          longitude: null,
          price: null,
          negotiable: false,
          image: null,
          sellerId: null,
          active: false,
        },
      };
    },
    methods: {
      // listen for update:location event, extract lat , lng from emitted values.
      updateLocation(latlng) {
        this.form.latitude = latlng.lat;
        this.form.longitude = latlng.lng;
        this.locationError = '';
      },
      async handleSubmit() {
        this.titleError = '';
        this.descriptionError = '';
        this.priceError = '';
        this.imageError = '';

        if (!this.form.title.trim()) {
          this.titleError = 'Title is required.';
        }

        if (!this.form.description.trim()) {
          this.descriptionError = 'Description is required.';
        }

        if (this.form.price === null || this.form.price < 0) {
          this.priceError = 'Price is required and must be positive.';
        }

        if (!this.form.latitude || !this.form.longitude){
          this.locationError = 'Please select a location.';
        }

        if(!this.form.image){
          this.imageError= 'Image is required.';
        }

       if (this.titleError || this.descriptionError || this.priceError || this.locationError || this.imageError) {
          return;
        }
        try {
          // handle Image upload to Firestore storage
          let imageUrl = '';
          if (this.form.image) {
            const uniqueFileName = `${Date.now()}-${this.form.image.name}`;
            const storageRef = ref(storage, `offer/${uniqueFileName}`);
            await uploadBytes(storageRef, this.form.image);
            imageUrl = await getDownloadURL(storageRef);
          }

          const geoHash = geohashForLocation([
            this.form.latitude,
            this.form.longitude,
          ]);
          // current user instance
          const auth = getAuth();
          const currentUser = auth.currentUser;

          // reference to the user document of current user
          const userRef = doc(db, 'user', currentUser.uid);

          // batch write to Firestore db
          const batch = writeBatch(db);

          // reference to the offer collection
          const offerRef = doc(collection(db, 'offer'));
          batch.set(offerRef, {
            title: this.form.title,
            description: this.form.description,
            geoHash: geoHash,
            latitude: this.form.latitude,
            longitude: this.form.longitude,
            price: this.form.price,
            negotiable: this.form.negotiable,
            image: imageUrl,
            sellerId: userRef,
            createdAt: new Date(),
            active: true,
          });

          // reference to the user offers sub-collection
          const userOfferRef = doc(collection(userRef, 'offers'), offerRef.id);
          batch.set(userOfferRef, {
            offer: offerRef,
          });

          // write batch to Firestore db
          await batch.commit();

          // redirect to BrowseOffers after successful submission
          this.$router.push('/browse-offers');
          console.log('Form submitted:', this.form);
        } catch (error) {
          console.error('Error creating offer ', error);
        }
      },
      handleDrop(event) {
        this.form.image = event.dataTransfer.files[0];
        this.fileName = this.form.image.name;
      },
      handleFileUpload(event) {
        this.form.image = event.target.files[0];
        this.fileName = this.form.image.name;
      },
      cancel() {
        this.$router.push('/browse-offers');
      },
    },
  };
</script>

<style scoped>
  .form-container {
    max-width: 600px; /* Adjust the max-width as needed */
  }
</style>
