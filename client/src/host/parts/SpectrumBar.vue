<script setup lang="ts">
defineProps<{ left: string; right: string }>();
</script>

<template>
  <div class="spectrum">
    <div class="track">
      <slot />
    </div>
    <div class="poles">
      <span class="sticker">{{ left }}</span>
      <span class="sticker">{{ right }}</span>
    </div>
  </div>
</template>

<style scoped>
.spectrum {
  width: 100%;
}

.track {
  position: relative;
  height: 64px;
  border: var(--line) solid var(--ink);
  border-radius: 32px;
  background: linear-gradient(90deg, var(--cyan), #b9f3ff 30%, #fff1c2 50%, #ffc1d6 70%, var(--pink));
  box-shadow: var(--shadow);
}

.poles {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.poles span {
  padding: 6px 20px;
  font-size: 30px;
  font-weight: 900;
}
</style>
