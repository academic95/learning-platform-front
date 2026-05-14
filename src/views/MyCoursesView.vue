<script setup lang="ts">
import { onMounted, ref, shallowRef } from "vue";
import api from "../api/axios";
import AppPagination from "../components/AppPagination.vue";

type MyCourse = {
  id: number;
  title: string;
  is_mandatory: boolean;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
};

type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

type MyCoursesResponse = {
  data: MyCourse[];
  meta?: PaginationMeta;
};

const courses = ref<MyCourse[]>([]);
const loading = shallowRef(false);
const error = shallowRef("");
const currentPage = shallowRef(1);
const pagination = ref<PaginationMeta>({
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: 0,
  to: null,
  total: 0,
});

const formatDate = (date: string) => new Date(date).toLocaleDateString("uk-UA");

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

const fetchMyCourses = async (page = currentPage.value) => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get<MyCoursesResponse>("/users/me/courses", {
      params: { page },
    });

    courses.value = response.data.data;
    currentPage.value = response.data.meta?.current_page ?? page;
    applyPagination(response.data.meta);
  } catch {
    error.value = "Не вдалося завантажити мої курси";
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  void fetchMyCourses(page);
};

onMounted(fetchMyCourses);
</script>

<template>
  <main class="page">
    <h1 class="page-title">Мої курси</h1>

    <p v-if="loading">Завантаження...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="!loading && courses.length === 0">
      Ви ще не записані на жоден курс.
    </p>

    <section class="list">
      <article v-for="course in courses" :key="course.id" class="card">
        <div class="header">
          <h2 class="card-title">{{ course.title }}</h2>

          <span v-if="course.is_mandatory" class="badge"> Обов'язковий </span>
        </div>

        <p>Прогрес: {{ course.progress }}%</p>

        <div class="progress">
          <div
            class="progress-fill"
            :style="{ width: `${course.progress}%` }"
          />
        </div>

        <p class="meta">
          Записано: {{ formatDate(course.enrolled_at) }}
        </p>

        <p v-if="course.completed_at" class="completed">
          Завершено: {{ formatDate(course.completed_at) }}
        </p>

        <RouterLink
          class="topics-link"
          :to="{ name: 'course-topics', params: { id: course.id } }"
        >
          Перейти до тем
        </RouterLink>
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
  margin: 0 0 24px;
}

.list {
  display: grid;
  gap: 20px;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  margin: 0;
}

.badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.progress {
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #111827;
}

.meta {
  color: #6b7280;
}

.completed {
  color: #047857;
}

.topics-link {
  color: #111827;
  font-weight: 700;
}

.error {
  color: #dc2626;
}
</style>
