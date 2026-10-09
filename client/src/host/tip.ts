/** A game-styled tooltip: the text goes to data-tip for the CSS sticker (tip.css) and to aria-label for screen readers. */
export const vTip = (el: HTMLElement, { value }: { value: string }): void => {
  el.dataset.tip = value;
  el.setAttribute('aria-label', value);
};
