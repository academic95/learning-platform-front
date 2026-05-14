<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import type { AxiosError } from 'axios';
import { useRouter } from 'vue-router';
import api from '../api/axios';

interface AuthResponse {
  token: string;
  user: unknown;
}

interface ApiErrorResponse {
  message?: string;
}

const router = useRouter();

const isLogin = shallowRef(true);
const loading = shallowRef(false);
const error = shallowRef('');

const name = shallowRef('');
const email = shallowRef('');
const password = shallowRef('');
const passwordConfirmation = shallowRef('');

const title = computed(() => (isLogin.value ? 'Вхід' : 'Реєстрація'));
const submitText = computed(() => {
  if (loading.value) {
    return 'Завантаження...';
  }

  return title.value;
});

const setAuthMode = (value: boolean) => {
  isLogin.value = value;
  error.value = '';
};

const submit = async () => {
  loading.value = true;
  error.value = '';

  try {
    const endpoint = isLogin.value ? '/auth/login' : '/auth/register';

    const payload = isLogin.value
      ? {
          email: email.value,
          password: password.value,
        }
      : {
          name: name.value,
          email: email.value,
          password: password.value,
          password_confirmation: passwordConfirmation.value,
        };

    const response = await api.post<AuthResponse>(endpoint, payload);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    await router.push({ name: 'courses' });
  } catch (err) {
    const apiError = err as AxiosError<ApiErrorResponse>;
    error.value = apiError.response?.data?.message || 'Щось пішло не так';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1 class="auth-title">{{ title }}</h1>

      <div class="tabs">
        <button
          class="tab-button"
          :class="{ active: isLogin }"
          type="button"
          @click="setAuthMode(true)"
        >
          Вхід
        </button>

        <button
          class="tab-button"
          :class="{ active: !isLogin }"
          type="button"
          @click="setAuthMode(false)"
        >
          Реєстрація
        </button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <label v-if="!isLogin" class="field">
          Імʼя
          <input v-model="name" class="input" type="text" required />
        </label>

        <label class="field">
          Електронна пошта
          <input v-model="email" class="input" type="email" required />
        </label>

        <label class="field">
          Пароль
          <input v-model="password" class="input" type="password" required />
        </label>

        <label v-if="!isLogin" class="field">
          Підтвердження пароля
          <input
            v-model="passwordConfirmation"
            class="input"
            type="password"
            required
          />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="submit-button" type="submit" :disabled="loading">
          {{ submitText }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f7fb;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.auth-title {
  margin: 0 0 24px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 8px;
}

.tab-button.active {
  background: #111827;
  color: white;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

.input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.submit-button {
  padding: 12px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 14px;
}
</style>
