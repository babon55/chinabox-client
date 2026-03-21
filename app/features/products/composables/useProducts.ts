import type { Products } from '../types';

// Auto-imported globally — no import needed in .vue files
export const useProducts = () => {
  const items = ref<Products[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchItems = async () => {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement fetch logic
      // items.value = await $fetch('/api/products');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading.value = false;
    }
  };

  return { items, loading, error, fetchItems };
};
