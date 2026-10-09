<script setup lang="ts">
import { computed } from 'vue';
import { view } from '../store';

const scene = computed(() => (view.value?.personal.kind === 'describe' ? view.value.personal.scene : ''));
</script>

<template>
  <div class="describe">
    <div class="label">Только вы видите это. Опишите вслух!</div>
    <div class="scene sticker display">{{ scene }}</div>
    <ul>
      <li>Не показывайте экран и не рисуйте в воздухе</li>
      <li>Говорите, где что находится: слева, сверху, большое, маленькое</li>
      <li>Чем похожее нарисуют, тем больше очков у вас</li>
    </ul>
  </div>
</template>

<style scoped>
.describe {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.label {
  font-weight: 800;
  color: var(--muted);
  text-align: center;
}

.scene {
  padding: 22px 18px;
  font-size: 28px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  background: var(--yellow);
}

ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
}
</style>
