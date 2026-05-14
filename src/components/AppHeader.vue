<script setup lang="ts">
import { shallowRef } from 'vue';
import { useRouter } from 'vue-router';

interface AuthUser {
  name?: string;
}

const router = useRouter();

const readStoredUser = (): AuthUser | null => {
  const rawUser = localStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

const user = shallowRef<AuthUser | null>(readStoredUser());

const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  await router.push({ name: 'login' });
};
</script>

<template>
  <header class="header">
    <div class="brand">
      <strong>Learning Platform</strong>
    </div>

    <nav class="navigation">
      <RouterLink class="nav-link" :to="{ name: 'courses' }">Курси</RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'my-courses' }">
        Мої курси
      </RouterLink>
    </nav>

    <div class="user">
      <span>{{ user?.name }}</span>
      <button class="logout-button" type="button" @click="logout">Вийти</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111827;
  color: white;
}

.brand {
  white-space: nowrap;
}

.navigation {
  display: flex;
  gap: 16px;
}

.nav-link {
  color: white;
  text-decoration: none;
  opacity: 0.8;
}

.nav-link.router-link-active {
  opacity: 1;
  font-weight: 700;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
