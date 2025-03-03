<template>
  <div class="p-4 sm:p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
      Browse Offers
    </h1>

    <!-- Filter/Search Inputs -->
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center"
    >
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search by title"
        class="w-full sm:w-64 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />
      <input
        type="number"
        v-model.number="minPrice"
        placeholder="Min Price"
        class="w-full sm:w-32 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />
      <input
        type="number"
        v-model.number="maxPrice"
        placeholder="Max Price"
        class="w-full sm:w-32 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />
      <button
        @click="resetFilters"
        class="w-full sm:w-auto p-2 bg-[#ea7643] text-white rounded shadow hover:bg-[#eb8e65] transition"
      >
        Reset Filters
      </button>
    </div>

    <!-- Map and Selected Offer Display -->
    <div
      class="mb-6 flex flex-col sm:flex-row gap-6 justify-center items-start"
    >
      <!-- Map -->
      <BrowseMap
        class="sm:w-1/2"
        :filteredOffers="filteredOffers"
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
    <div class="flex flex-wrap justify-center items-stretch gap-10">
      <OfferCard
        v-for="item in filteredOffers"
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
      <input v-model="editItem.title" class="w-full p-2 border rounded mb-2" placeholder="Title" />
      <input v-model="editItem.price" type="number" class="w-full p-2 border rounded mb-2" placeholder="Price" />
      <textarea v-model="editItem.description" class="w-full p-2 border rounded mb-2" placeholder="Description"></textarea>
      <div class="flex justify-between">
        <button @click="saveEdit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
        <button @click="deleteOffer(editItem.id)" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
        <button @click="editItem = null" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
    </div>
  </div>

  <!-- Background Overlay -->
  <div class="opacity-25 fixed inset-0 z-40 bg-black"></div>
  </div>
</template>

<script>
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  
  import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
  } from 'firebase/firestore';
  import { db } from '@/firebase';
  import { fetchItemWithSeller } from '@/firebaseService'; // Import the function
  import OfferCard from '@/components/OfferCard.vue';
  import BrowseMap from '@/components/BrowseMap.vue';

  export default {
    name: 'BrowseOffers',
    components: {
      OfferCard,
      BrowseMap,
    },
    data() {
      return {
        offers: [],
        searchTerm: '',
        minPrice: null,
        maxPrice: null,
        isAdmin: false, // Only admins can edit
        editItem: null, // Holds the offer being edited
        selectedOffer: null, // Holds the offer selected on the map
      };
    },
    computed: {
      filteredOffers() {
        return this.offers.filter((offer) => {
          // Check if the offer title includes the search term (case insensitive)
          const matchesSearch = this.searchTerm
            ? offer.title.toLowerCase().includes(this.searchTerm.toLowerCase())
            : true;
          // Check if the offer's price is within the min and max price range
          const matchesMinPrice =
            this.minPrice != null ? offer.price >= this.minPrice : true;
          const matchesMaxPrice =
            this.maxPrice != null ? offer.price <= this.maxPrice : true;

          return (
            !offer.sold && matchesSearch && matchesMinPrice && matchesMaxPrice
          );
        });
      },
    },
    async created() {
      await this.fetchActiveOffers();
      this.checkAdminStatus(); // Check if the user is an admin
    },
    methods: {
      async fetchActiveOffers() {
        try {
          const q = query(collection(db, 'offer'), where('active', '==', true));
          const querySnapshot = await getDocs(q);

          // Fetch all items with resolved sellerId
          const items = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const resolvedItem = await fetchItemWithSeller(doc.id);
              return resolvedItem ? { id: doc.id, ...resolvedItem } : null;
            })
          );

          // Remove null values (failed fetches)
          this.offers = items.filter((item) => item !== null);
        } catch (error) {
          console.error('Error fetching active offers:', error.message);
        }
      },
      resetFilters() {
        this.searchTerm = '';
        this.minPrice = null;
        this.maxPrice = null;
      },
      async checkAdminStatus() {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, 'user', user.uid));
              this.isAdmin = userDoc.exists() && userDoc.data().admin === true;
            } catch (error) {
              console.error('Error checking admin status:', error);
            }
          } else {
            this.isAdmin = false;
          }
        });
      },
      openEditMenu(event, item) {
        if (this.isAdmin) {
          this.editItem = { ...item }; // Clone the item to edit
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
          await this.fetchActiveOffers(); // Refresh the offers list
        } catch (error) {
          console.error('Error updating offer:', error);
        }
      },
      async deleteOffer(id) {
        if (!confirm('Are you sure you want to delete this offer?')) return;
        try {
          await deleteDoc(doc(db, 'offer', id));
          this.editItem = null;
          await this.fetchActiveOffers(); // Refresh the offers list
        } catch (error) {
          console.error('Error deleting offer:', error);
        }
      },
      async setSelectedOffer(offer) {
        this.selectedOffer = offer;
      },
    },
  };
</script>
