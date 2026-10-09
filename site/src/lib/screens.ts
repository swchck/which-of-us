import generated from '../generated.json';

const present = new Set<string>(generated.screens);

export const screenUrl = (name: string) => `${import.meta.env.BASE_URL}screens/${name}.webp`;

export const hasScreen = (name: string) => present.has(name);

/** First of the names that exists, so a missing shot falls back to the next best one. */
export const firstScreen = (...names: string[]) => names.find(hasScreen);
