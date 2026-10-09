// tests reach the client's scene registry, whose lazy imports point at .vue files tsc cannot read
declare module '*.vue' {
  import type { Component } from 'vue';
  const component: Component;
  export default component;
}
