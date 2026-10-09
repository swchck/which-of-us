const rules = new Intl.PluralRules('ru');

/** Picks the Russian plural form: one, few, many (1 игра, 2 игры, 5 игр). */
export function plural(n: number, forms: [string, string, string]): string {
  const cat = rules.select(n);
  return cat === 'one' ? forms[0] : cat === 'few' ? forms[1] : forms[2];
}

export const num = (n: number) => n.toLocaleString('ru-RU');
