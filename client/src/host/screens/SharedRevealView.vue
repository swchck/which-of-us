<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import InkView from '../../common/InkView.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'sharedReveal' ? view.value.phase : null));
const artists = computed(() => phase.value?.order.map((id) => playerById(id)).filter((p) => p !== undefined) ?? []);

onMounted(() => audio.sfx('fanfare'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <div class="title display plate">«{{ phase.theme }}»</div>
    <div class="frame">
      <InkView :code="view.code" :board="phase.board" :ink="phase.ink" :replay="6000" />
    </div>
    <div class="credits">
      <span>Авторы:</span>
      <Avatar v-for="p in artists" :key="p.id" :player="p" :code="view.code" :size="54" :ring="3" />
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 30px 60px 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 44px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
}

.frame {
  width: 1000px;
  padding: 26px;
  background: linear-gradient(135deg, #c98a3a, #ffd23f 40%, #c98a3a);
  border: 6px solid var(--ink);
  border-radius: 10px;
  box-shadow:
    var(--shadow),
    inset 0 0 0 6px rgba(27, 16, 51, 0.4);
  animation: pop-in 600ms both;
}

.frame :deep(.inkview) {
  border: 4px solid var(--ink);
}

.credits {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 26px;
  font-weight: 900;
}
</style>
