<template>
  <nav class="relative bg-lightbackground">
    <div class="container px-6 py-4 mx-auto">
      <div class="lg:flex lg:items-center lg:justify-center">
        <div class="flex items-center justify-between">
          <router-link to="/">
            <img
              class="w-auto h-7 sm:h-8"
              src="https://i.ibb.co/KSvxB0y/lootfinder.png"
              alt="Logo"
            />
          </router-link>

          <!-- Mobile menu button -->
          <div class="flex lg:hidden">
            <button
              @click="isOpen = !isOpen"
              type="button"
              class="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 z-50"
              aria-label="toggle menu"
            >
              <svg
                v-if="!isOpen"
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 8h16M4 16h16"
                />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          :class="[
            isOpen
              ? 'translate-x-0 opacity-100 bg-lightbackground'
              : 'opacity-0 -translate-x-full',
          ]"
          class="absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center"
        >
          <div class="flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8">
            <router-link
              to="/search-bar"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              Search
            </router-link>
            <router-link
              to="/browse-offers"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              Browse Offers
            </router-link>
            <router-link
              to="/dashboard"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              Dashboard
            </router-link>
            <router-link
              to="/create-offer"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              Create Offer
            </router-link>
            <router-link
              to="/update-offers"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              My Offers
            </router-link>
            <router-link
              to="/inbox"
              class="px-3 py-2 mx-3 mt-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white"
            >
              Inbox
            </router-link>
          </div>

          <div class="flex items-center mt-4 lg:mt-0">
            <!-- Display login button if user is not logged in -->
            <template v-if="!user">
              <button
                @click="login"
                class="px-4 py-2 text-white bg-border rounded-md hover:bg-nav focus:outline-none focus:ring"
              >
                Login
              </button>
            </template>

            <!-- Display profile picture if user is logged in -->
            <template v-else>
              <router-link 
                to="/profile"
                class="px-3 py-2 -mx-3 -my-2 text-black transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-nav hover:text-white flex items-center w-full lg:mx-1 lg:my-1"
              >
                <div class="w-8 h-8 rounded-full border-2 border-gray-400 overflow-hidden flex-shrink-0">
                  <img
                    :src="user?.photoURL || 'https://via.placeholder.com/150'"
                    class="object-cover w-full h-full aspect-square"
                    alt="avatar"
                  />
                </div>
                <h3 class="mx-2 text-gray-700 lg:hidden">
                  {{ user?.displayName || 'Guest' }}
                </h3>
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
  import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
  } from 'firebase/auth';
  import { ref, onMounted } from 'vue';

  export default {
    name: 'Navbar',
    setup() {
      const user = ref(null);
      const isOpen = ref(false);
      const auth = getAuth();

      // Watch for authentication state changes
      onMounted(() => {
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            user.value = {
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            };
          } else {
            user.value = null;
          }
        });
      });

      // Login method
      const login = async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          user.value = {
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          };
        } catch (error) {
          console.error('Login failed:', error.message);
        }
      };

      return { user, isOpen, login };
    },
  };
</script>