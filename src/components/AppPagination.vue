<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  from: number | null;
  lastPage: number;
  loading?: boolean;
  to: number | null;
  total: number;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const pages = computed(() => {
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.lastPage, props.currentPage + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

const hasMultiplePages = computed(() => props.lastPage > 1);

const goToPage = (page: number) => {
  if (page < 1 || page > props.lastPage || page === props.currentPage) {
    return;
  }

  emit('pageChange', page);
};
</script>

<template>
  <nav
    v-if="hasMultiplePages"
    class="pagination"
    aria-label="Пагінація"
  >
    <p class="pagination-summary">
      Показано {{ from }}-{{ to }} з {{ total }}
    </p>

    <div class="pagination-actions">
      <button
        class="pagination-button"
        type="button"
        :disabled="loading || currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Назад
      </button>

      <button
        v-for="page in pages"
        :key="page"
        class="pagination-button"
        :class="{ active: page === currentPage }"
        type="button"
        :aria-current="page === currentPage ? 'page' : undefined"
        :disabled="loading"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-button"
        type="button"
        :disabled="loading || currentPage === lastPage"
        @click="goToPage(currentPage + 1)"
      >
        Далі
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.pagination-summary {
  margin: 0;
  color: #6b7280;
}

.pagination-actions {
  display: flex;
  gap: 8px;
}

.pagination-button {
  min-width: 40px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #111827;
  cursor: pointer;
}

.pagination-button.active {
  border-color: #111827;
  background: #111827;
  color: white;
}

.pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
