<template>
  <div>
    <!-- Map and Selected Offer Display -->
    <div
      class="mb-6 flex flex-col sm:flex-row gap-6 justify-center items-center"
    >
      <!-- Map -->
      <BrowseMap
        class="sm:w-1/2"
        :filteredOffers="filteredItems"
        @marker-clicked="setSelectedOffer"
      />

      <!-- Selected Offer Card -->
      <OfferCard
        v-if="selectedOffer"
        class="sm:w-1/3"
        :id="selectedOffer.id"
        :title="selectedOffer.title"
        :description="selectedOffer.description"
        :price="selectedOffer.price"
        :image="selectedOffer.image"
        :sellerId="selectedOffer.sellerId"
      />
    </div>

    <!-- Offers List -->
    <div class="flex flex-wrap justify-center items-stretch gap-10 mt-10">
      <OfferCard
        v-for="item in filteredItems"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :description="item.description"
        :price="item.price"
        :image="item.image"
        :sellerId="item.sellerId"
        @contextmenu.prevent="openEditMenu($event, item)"
      />
    </div>
  </div>
  
  <div v-if="editItem">
    <!-- Edit Modal (Shown only if editing is enabled) -->
    <div class="fixed inset-0 z-50 flex justify-center items-center">
      <div class="flex flex-col max-w-5xl rounded-lg shadow-lg bg-white">
        <!-- Header -->
        <div class="p-2">
          <div class="flex justify-between items-start">
            <h3 class="text-2xl font-bold">Developer Editing</h3>
          </div>
        </div>

        <div class="bg-white p-2 rounded-lg shadow-lg w-96">
          <h2 class="text-xl font-bold mb-4">Edit Offer</h2>
          <input
            v-model="editItem.title"
            class="w-full p-2 border rounded mb-2"
            placeholder="Title"
          />
          <input
            v-model="editItem.price"
            type="number"
            class="w-full p-2 border rounded mb-2"
            placeholder="Price"
          />
          <textarea
            v-model="editItem.description"
            class="w-full p-2 border rounded mb-2"
            placeholder="Description"
          ></textarea>
          <div class="flex justify-between">
            <button
              @click="saveEdit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              @click="deleteOffer(editItem.id)"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              @click="editItem = null"
              class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Overlay -->
    <div class="opacity-25 fixed inset-0 z-40 bg-black"></div>
  </div>
</template>

<script>
  import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
  import { db } from '@/firebase';
  import OfferCard from '@/components/OfferCard.vue';
  import BrowseMap from '@/components/BrowseMap.vue';

  export default {
    name: 'OffersView',
    components: {
      OfferCard,
      BrowseMap,
    },
    props: {
      filteredItems: {
        type: Array,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        selectedOffer: null,
        editItem: null,
      };
    },
    methods: {
      setSelectedOffer(offer) {
        this.selectedOffer = offer;
      },
      openEditMenu(event, item) {
        console.log('isAdmin:', this.isAdmin);
        if (this.isAdmin) {
          this.editItem = { ...item };
        }
      },
      async saveEdit() {
        if (!this.editItem) return;
        try {
          await updateDoc(doc(db, 'offer', this.editItem.id), {
            title: this.editItem.title,
            price: this.editItem.price,
            description: this.editItem.description,
          });
          this.editItem = null;
          this.$emit('refresh-data');
        } catch (error) {
          console.error('Error updating offer:', error);
        }
      },
      async deleteOffer(id) {
        if (!confirm('Are you sure you want to delete this offer?')) return;
        try {
          await deleteDoc(doc(db, 'offer', id));
          this.editItem = null;
          this.$emit('refresh-data');
        } catch (error) {
          console.error('Error deleting offer:', error);
        }
      },
    },
  };
</script>
