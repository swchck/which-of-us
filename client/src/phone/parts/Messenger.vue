<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { dmThread } from '../../../../shared/catalog';
import { CHAT_MESSAGE_MAX, type ChatThread, type PublicPlayer } from '../../../../shared/protocol';
import { event } from '../haptics';

const props = defineProps<{
  chats: ChatThread[];
  players: PublicPlayer[];
  you: string;
  code: string;
  left: number;
  closed?: boolean;
  /** Ready-made openers offered as chips in a chat with this player. */
  hints?: { to: string; lines: string[] };
  /** Just the one group chat, opened straight away: no contacts list and no direct messages. */
  single?: boolean;
  /** Overrides how a sender is signed in a group, e.g. by a mask instead of a name. */
  names?: Record<string, string>;
}>();
const emit = defineEmits<{ send: [thread: string, text: string] }>();

const open = ref<string | null>(props.single ? (props.chats[0]?.id ?? null) : null);
const text = ref('');
const seen = ref<Record<string, number>>({});
const list = ref<HTMLElement>();

interface Contact {
  thread: string;
  title: string;
  player?: PublicPlayer;
  group: boolean;
  messages: ChatThread['messages'];
}

const contacts = computed<Contact[]>(() => {
  const byId = new Map(props.chats.map((t) => [t.id, t]));
  const groups = props.chats
    .filter((t) => !t.id.startsWith('dm:'))
    .map((t) => ({ thread: t.id, title: t.title ?? 'Группа', group: true, messages: t.messages }));
  const people = props.players
    .filter((p) => p.id !== props.you)
    .map((p) => {
      const thread = dmThread(props.you, p.id);
      return { thread, title: p.name, player: p, group: false, messages: byId.get(thread)?.messages ?? [] };
    })
    .sort((a, b) => (b.messages.at(-1)?.id ?? 0) - (a.messages.at(-1)?.id ?? 0));
  return [...groups, ...people];
});
const current = computed(() => contacts.value.find((c) => c.thread === open.value) ?? null);
const unread = (c: Contact) => c.messages.filter((m) => m.from !== props.you && m.id > (seen.value[c.thread] ?? 0)).length;
const name = (id: string) => props.names?.[id] ?? props.players.find((p) => p.id === id)?.name ?? '…';
const hintLines = computed(() => (current.value?.player && current.value.player.id === props.hints?.to ? props.hints.lines : []));

function markRead(): void {
  const c = current.value;
  if (c) seen.value = { ...seen.value, [c.thread]: c.messages.at(-1)?.id ?? 0 };
}

async function scrollDown(): Promise<void> {
  await nextTick();
  list.value?.scrollTo({ top: list.value.scrollHeight });
}

watch(
  () => contacts.value.reduce((n, c) => n + c.messages.filter((m) => m.from !== props.you).length, 0),
  (n, before) => {
    if (n > before) event('tick');
    markRead();
    void scrollDown();
  },
);

function enter(thread: string): void {
  open.value = thread;
  markRead();
  void scrollDown();
}

function submit(): void {
  const value = text.value.trim();
  if (!value || !open.value || props.closed || props.left <= 0) return;
  emit('send', open.value, value);
  text.value = '';
}
</script>

<template>
  <div class="messenger sticker">
    <template v-if="!current">
      <div class="head">Чаты <small>осталось сообщений: {{ left }}</small></div>
      <div class="contacts">
        <button v-for="c in contacts" :key="c.thread" class="contact" @click="enter(c.thread)">
          <Avatar v-if="c.player" :player="c.player" :code="code" :size="44" :ring="3" />
          <span v-else class="group-icon">🤫</span>
          <span class="who">
            <b>{{ c.title }}</b>
            <small>{{ c.messages.at(-1)?.text ?? (c.group ? 'Общий чат' : 'Напишите первым') }}</small>
          </span>
          <span v-if="unread(c)" class="badge">{{ unread(c) }}</span>
        </button>
      </div>
    </template>
    <template v-else>
      <div class="head">
        <button v-if="!single" class="back" aria-label="К чатам" @click="open = null">‹</button>
        <b>{{ current.title }}</b>
        <small v-if="single">осталось сообщений: {{ left }}</small>
      </div>
      <div ref="list" class="messages">
        <p v-if="current.messages.length === 0" class="empty">Здесь пока пусто</p>
        <div v-for="m in current.messages" :key="m.id" class="bubble" :class="{ mine: m.from === you }">
          <small v-if="current.group && m.from !== you">{{ name(m.from) }}</small>
          {{ m.text }}
        </div>
      </div>
      <div v-if="hintLines.length && !closed" class="hints">
        <button v-for="h in hintLines" :key="h" class="hint" @click="text = h">{{ h }}</button>
      </div>
      <form class="compose" @submit.prevent="submit">
        <input
          v-model="text"
          :maxlength="CHAT_MESSAGE_MAX"
          :disabled="closed || left <= 0"
          autocomplete="off"
          enterkeyhint="send"
          :placeholder="closed ? 'Чат закрыт' : left <= 0 ? 'Сообщения кончились' : 'Сообщение'"
        />
        <button class="btn pink" type="submit" :disabled="!text.trim() || closed || left <= 0" aria-label="Отправить">➤</button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.messenger {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 3px solid var(--ink);
  font-weight: 900;
  font-size: 19px;
}

.head small {
  margin-left: auto;
  font-size: 13px;
  color: var(--muted);
}

.back {
  border: 0;
  background: none;
  font: inherit;
  font-size: 30px;
  line-height: 1;
  padding: 0 6px;
  color: var(--ink);
}

.contacts {
  flex: 1;
  overflow-y: auto;
}

.contact {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  background: none;
  font: inherit;
  color: var(--ink);
  text-align: left;
}

.group-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  font-size: 26px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--yellow);
}

.who {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.who small {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--muted);
  font-weight: 700;
}

.badge {
  min-width: 26px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--pink);
  color: #fff;
  font-weight: 900;
  text-align: center;
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.empty {
  margin: auto;
  color: var(--muted);
  font-weight: 800;
}

.bubble {
  max-width: 80%;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 16px 16px 16px 4px;
  border: 3px solid var(--ink);
  background: #fff;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.bubble small {
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: var(--pink);
}

.bubble.mine {
  align-self: flex-end;
  border-radius: 16px 16px 4px 16px;
  background: var(--cyan);
}

.hints {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 12px 8px;
}

.hint {
  flex: none;
  max-width: 240px;
  padding: 6px 10px;
  border-radius: 12px;
  border: 2px dashed var(--ink);
  background: var(--yellow);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  color: var(--ink);
}

.compose {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 3px solid var(--ink);
}

.compose input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-weight: 800;
  padding: 10px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  outline: none;
  font-size: 18px;
}

.compose .btn {
  width: 56px;
  font-size: 22px;
}
</style>
