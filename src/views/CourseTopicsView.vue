<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api/axios';

type Topic = {
  id: number;
  title: string;
  description: string | null;
  position: number;
  is_completed: boolean;
  completed_at: string | null;
};

type TopicsResponse = {
  data: Topic[];
};

type CompleteTopicResponse = {
  progress: number;
};

const route = useRoute();

const topics = ref<Topic[]>([]);
const loading = shallowRef(false);
const error = shallowRef('');
const progress = shallowRef<number | null>(null);

const courseId = computed(() => String(route.params.id));

const fetchTopics = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get<TopicsResponse>(
      `/courses/${courseId.value}/topics`
    );
    topics.value = response.data.data;
  } catch {
    error.value = 'Не вдалося завантажити теми курсу';
  } finally {
    loading.value = false;
  }
};

const openTopic = async (topic: Topic) => {
  if (topic.is_completed) {
    return;
  }

  try {
    const response = await api.post<CompleteTopicResponse>(
      `/courses/${courseId.value}/topics/${topic.id}/complete`
    );

    topic.is_completed = true;
    topic.completed_at = new Date().toISOString();
    progress.value = response.data.progress;
  } catch {
    error.value = 'Не вдалося оновити прогрес';
  }
};

onMounted(fetchTopics);
</script>

<template>
  <main class="page">
    <h1 class="page-title">Теми курсу</h1>

    <p v-if="loading">Завантаження...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="progress !== null">
      Поточний прогрес: {{ progress }}%
    </p>

    <section class="list">
      <article
        v-for="topic in topics"
        :key="topic.id"
        class="card"
        :class="{ completed: topic.is_completed }"
      >
        <div>
          <h2 class="topic-title">{{ topic.position }}. {{ topic.title }}</h2>
          <p v-if="topic.description" class="topic-description">
            {{ topic.description }}
          </p>
        </div>

        <button
          class="topic-action"
          type="button"
          :disabled="topic.is_completed"
          @click="openTopic(topic)"
        >
          {{ topic.is_completed ? 'Пройдено' : 'Відкрити' }}
        </button>
      </article>
    </section>
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
  gap: 16px;
}

.card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.card.completed {
  opacity: 0.75;
}

.topic-title {
  margin: 0 0 8px;
}

.topic-description {
  margin: 0;
}

.topic-action {
  font-weight: 700;
  border: none;
  background: transparent;
  color: #111827;
  cursor: pointer;
}

.topic-action:disabled {
  cursor: not-allowed;
}

.error {
  color: #dc2626;
}
</style>
