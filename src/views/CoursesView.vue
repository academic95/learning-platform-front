<script setup lang="ts">
import type { AxiosError } from 'axios';
import { onMounted, ref, shallowRef } from 'vue';
import api from '../api/axios';
import AppPagination from '../components/AppPagination.vue';

type Course = {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
  is_mandatory: boolean;
  topics_count?: number;
  is_enrolled?: boolean;
};

type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

type CoursesResponse = {
  data: Course[];
  meta?: PaginationMeta;
};

const courses = ref<Course[]>([]);
const loading = shallowRef(false);
const error = shallowRef('');
const currentPage = shallowRef(1);
const pagination = ref<PaginationMeta>({
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: 0,
  to: null,
  total: 0,
});

const applyPagination = (meta: PaginationMeta | undefined) => {
  pagination.value = meta ?? {
    current_page: currentPage.value,
    from: courses.value.length > 0 ? 1 : null,
    last_page: 1,
    per_page: courses.value.length,
    to: courses.value.length > 0 ? courses.value.length : null,
    total: courses.value.length,
  };
};

const fetchCourses = async (page = currentPage.value) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get<CoursesResponse>('/courses', {
      params: { page },
    });

    courses.value = response.data.data;
    currentPage.value = response.data.meta?.current_page ?? page;
    applyPagination(response.data.meta);
  } catch {
    error.value = 'Не вдалося завантажити курси';
  } finally {
    loading.value = false;
  }
};

const enroll = async (course: Course) => {
  try {
    await api.post(`/courses/${course.id}/enroll`);
    course.is_enrolled = true;
  } catch (err) {
    const apiError = err as AxiosError;

    if (apiError.response?.status === 409) {
      course.is_enrolled = true;
      return;
    }

    error.value = 'Не вдалося записатися на курс';
  }
};

const changePage = (page: number) => {
  void fetchCourses(page);
};

onMounted(fetchCourses);
</script>

<template>
  <main class="page">
    <h1 class="page-title">Каталог курсів</h1>

    <p v-if="loading">Завантаження...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="grid">
      <article v-for="course in courses" :key="course.id" class="card">
        <div class="card-header">
          <h2 class="card-title">{{ course.title }}</h2>

          <span v-if="course.is_mandatory" class="badge">
            Обов'язковий
          </span>
        </div>

        <p>{{ course.description }}</p>

        <div class="meta">
          <span>{{ course.duration_hours }} год.</span>
          <span v-if="course.topics_count !== undefined">
            Тем: {{ course.topics_count }}
          </span>
        </div>

        <button
          class="enroll-button"
          :disabled="course.is_enrolled"
          @click="enroll(course)"
        >
          {{ course.is_enrolled ? 'Записаний' : 'Записатись' }}
        </button>
      </article>
    </section>

    <AppPagination
      :current-page="pagination.current_page"
      :from="pagination.from"
      :last-page="pagination.last_page"
      :loading="loading"
      :to="pagination.to"
      :total="pagination.total"
      @page-change="changePage"
    />
  </main>
</template>

<style scoped>
.page {
  padding: 32px;
}

.page-title {
  margin-bottom: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.card-title {
  font-size: 20px;
  margin: 0;
}

.badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.meta {
  display: flex;
  gap: 16px;
  color: #6b7280;
  margin: 16px 0;
}

.enroll-button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #111827;
  color: white;
  cursor: pointer;
}

.enroll-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
}
</style>
