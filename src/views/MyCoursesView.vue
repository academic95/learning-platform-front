<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '../api/axios';

type MyCourse = {
  id: number;
  title: string;
  is_mandatory: boolean;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
};

const courses = ref<MyCourse[]>([]);
const loading = ref(false);
const error = ref('');

const fetchMyCourses = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/users/me/courses');
    courses.value = response.data.data;
  } catch {
    error.value = 'Не вдалося завантажити мої курси';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMyCourses);
</script>

<template>
  <main class="page">
    <h1>Мої курси</h1>

    <p v-if="loading">Завантаження...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="!loading && courses.length === 0">
      Ви ще не записані на жоден курс.
    </p>

    <section class="list">
      <article v-for="course in courses" :key="course.id" class="card">
        <div class="header">
          <h2>{{ course.title }}</h2>

          <span v-if="course.is_mandatory" class="badge">
            Обов'язковий
          </span>
        </div>

        <p>Прогрес: {{ course.progress }}%</p>

        <div class="progress">
          <div
            class="progress-fill"
            :style="{ width: `${course.progress}%` }"
          />
        </div>

        <p class="meta">
          Записано: {{ new Date(course.enrolled_at).toLocaleDateString('uk-UA') }}
        </p>

        <p v-if="course.completed_at" class="completed">
          Завершено: {{ new Date(course.completed_at).toLocaleDateString('uk-UA') }}
        </p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding: 32px;
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

h2 {
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

.error {
  color: #dc2626;
}
</style>