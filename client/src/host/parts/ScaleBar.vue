<script setup lang="ts">
import { SCALE_MAX } from '../../../../shared/protocol';
import { scalePos } from './scale';

defineProps<{ low: string; high: string }>();
</script>

<template>
  <div class="scale">
    <div class="track">
      <span v-for="n in SCALE_MAX + 1" :key="n" class="tick display" :style="{ left: scalePos(n - 1) }">
        {{ n - 1 }}
      </span>
      <slot />
    </div>
    <div class="ends">
      <span>{{ low }}</span>
      <span>{{ high }}</span>
    </div>
  </div>
</template>

<style scoped>
.scale {
  width: 100%;
  padding: 0 40px;
}

.track {
  position: relative;
  height: 54px;
  border-radius: 999px;
  border: var(--line) solid var(--ink);
  background: linear-gradient(90deg, var(--cyan), var(--yellow), var(--pink));
  box-shadow: var(--shadow);
}

.tick {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  font-weight: 900;
  color: var(--ink);
}

.ends {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 24px;
  font-weight: 800;
}
</style>
