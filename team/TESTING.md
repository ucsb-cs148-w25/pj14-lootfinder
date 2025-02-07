# Testing Documentation

## Testing Library

We used **Vitest** as the testing framework for our project. Vitest is a fast and lightweight testing library that is compatible with Vite, making it an excellent choice for Vue.js projects.

## Testing Approach

Our approach to testing involves writing unit tests for individual components to ensure they behave as expected. We use the `@vue/test-utils` library to mount components and interact with them in a test environment.

## Unit Test Example

Below is an example of a unit test for the `BrowseOffers.vue` component. This test verifies that the component correctly filters offers based on a search term, minimum price, and maximum price.

```javascript
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
```