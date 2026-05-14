<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '../api/axios';

type Course = {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
  is_mandatory: boolean;
  topics_count?: number;
  is_enrolled?: boolean;
};

const courses = ref<Course[]>([]);
const loading = ref(false);
const error = ref('');

const fetchCourses = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/courses');
    courses.value = response.data.data;
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
  } catch (err: any) {
    if (err.response?.status === 409) {
      course.is_enrolled = true;
      return;
    }

    error.value = 'Не вдалося записатися на курс';
  }
};

onMounted(fetchCourses);
</script>

<template>
  <main class="page">
    <h1>Каталог курсів</h1>

    <p v-if="loading">Завантаження...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="grid">
      <article v-for="course in courses" :key="course.id" class="card">
        <div class="card-header">
          <h2>{{ course.title }}</h2>

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
          :disabled="course.is_enrolled"
          @click="enroll(course)"
        >
          {{ course.is_enrolled ? 'Записаний' : 'Записатись' }}
        </button>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding: 32px;
}

h1 {
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

h2 {
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

button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #111827;
  color: white;
  cursor: pointer;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
}
</style>