<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18 });
</script>

<template>
  <span class="new" :style="{ fontSize: `${size}px` }" aria-label="Новинка">NEW</span>
</template>

<style scoped>
.new {
  position: relative;
  display: inline-block;
  flex: none;
  padding: 0.15em 0.5em 0.1em;
  overflow: hidden;
  border: 0.16em solid var(--ink);
  border-radius: 0.5em;
  background: var(--yellow);
  color: var(--ink);
  font-family: inherit;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.1;
  box-shadow: 0.12em 0.16em 0 var(--ink);
  rotate: -8deg;
  animation: new-wobble 2.4s ease-in-out infinite;
}

/* a glint sweeps across now and then, like light on a fresh sticker */
.new::after {
  content: "";
  position: absolute;
  inset: -20% auto -20% -60%;
  width: 25%;
  rotate: 20deg;
  background: rgba(255, 255, 255, 0.5);
  animation: new-glint 2.4s ease-in-out infinite;
}

@keyframes new-wobble {
  0%,
  100% {
    rotate: -8deg;
    scale: 1;
  }
  15% {
    rotate: 4deg;
    scale: 1.12;
  }
  30% {
    rotate: -8deg;
    scale: 1;
  }
}

@keyframes new-glint {
  0%,
  40% {
    left: -60%;
  }
  70%,
  100% {
    left: 130%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .new,
  .new::after {
    animation: none;
  }
}
</style>
