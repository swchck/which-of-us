<script setup lang="ts">
defineProps<{ title: string; note?: string; on: boolean }>();
defineEmits<{ flip: [] }>();
</script>

<template>
  <div class="row" :class="{ on }">
    <div class="text" @click="$emit('flip')">
      <div class="rtitle">{{ title }}</div>
      <p v-if="note" class="note">{{ note }}</p>
    </div>
    <button class="toggle" role="switch" :aria-checked="on" :aria-label="title" @click="$emit('flip')">
      <span class="knob"></span>
    </button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.rtitle {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
}

.note {
  margin: 0;
  line-height: 1.3;
  color: #6b5a99;
  font-size: 20px;
  font-weight: 700;
}

.toggle {
  position: relative;
  flex: none;
  width: 74px;
  height: 44px;
  border-radius: 999px;
  border: 4px solid var(--ink);
  background: var(--muted);
  cursor: pointer;
  transition: background 200ms;
}

.on .toggle {
  background: var(--green);
}

.toggle .knob {
  position: absolute;
  top: 50%;
  left: 3px;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--ink);
  transform: translateY(-50%);
  transition: transform 200ms;
}

/* inside the 4px border the track is 66px wide: 3px gap, 30px knob, 30px travel, 3px gap */
.on .toggle .knob {
  transform: translate(30px, -50%);
}

.toggle:focus-visible {
  outline: 4px solid var(--pink);
  outline-offset: 3px;
}
</style>
