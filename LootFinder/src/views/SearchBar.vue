<template>
    <div class="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <div class="mb-6 flex flex-col sm:flex-row sm:justify-center sm:items-center">
            <input 
                v-model="query" 
                type="text" 
                placeholder="Search for users" 
                class="w-full sm:w-96 md:w-[500px] lg:w-[600px] p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
            />
        </div>
        <div class="flex flex-wrap justify-center items-stretch gap-8">
            <ProfileCard 
                v-for="user in filteredUsers"
                :key="user.id"
                :displayName="user.displayName" 
                :email="user.email" 
                :title="user.title" 
                :image="user.image" 
                :sellerId="user.sellerId" 
            />
        </div>
    </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import ProfileCard from '@/components/ProfileCard.vue';

export default {
    name: 'SearchBar',
    components: {
        ProfileCard,
    },
    data() {
        return {
            query: '',
            users: [], // Store all users from Firestore
        };
    },
    computed: {
        filteredUsers() {
            return this.users.filter(user => {
                return user.displayName.toLowerCase().includes(this.query.toLowerCase());
            });
        }
    },
    async created() {
        await this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            try {
                const usersRef = collection(db, "user");
                const querySnapshot = await getDocs(usersRef);

                this.users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    }
};
</script>
