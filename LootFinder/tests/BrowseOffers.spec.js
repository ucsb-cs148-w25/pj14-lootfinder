import { mount } from '@vue/test-utils';
import BrowseOffers from '@/views/BrowseOffers.vue';

describe('BrowseOffers.vue', () => {
  it('filters offers based on search term, min price, and max price', async () => {
    const wrapper = mount(BrowseOffers, {
      data() {
        return {
          offers: [
            { id: 1, title: 'Offer 1', price: 100, active: true },
            { id: 2, title: 'Offer 2', price: 200, active: true },
            { id: 3, title: 'Special Offer', price: 300, active: true },
          ],
          searchTerm: 'Special',
          minPrice: 150,
          maxPrice: 350,
        };
      },
    });

    expect(wrapper.vm.filteredOffers).toEqual([
      { id: 3, title: 'Special Offer', price: 300, active: true },
    ]);
  });
});