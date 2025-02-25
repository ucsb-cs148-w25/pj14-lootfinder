<template>
    <div class="w-70 bg-white shadow-lg rounded-xl overflow-hidden p-6 flex flex-col items-center space-y-4">
        <!-- Profile Image -->
        <img 
            :src="image" 
            alt="Profile Picture" 
            class="w-28 h-28 rounded-full border-4 border-blue-500 shadow-md"
        />

        <!-- User Info -->
        <div class="text-center">
            <p class="text-xl font-semibold text-gray-800">{{ displayName }}</p>
            <p class="text-sm text-gray-600"><strong>Email:</strong> {{ email }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
            <button
                @click="openChat"
                class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                Message Seller
            </button>
        </div>
    </div>
</template>

<script>    
export default {
    name: "ProfileCard",
    props: {
        id: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
    },
    methods: {
        openChat() {
            this.$router.push(`/chat/${this.sellerId}`);
        },
        },
    };
</script>