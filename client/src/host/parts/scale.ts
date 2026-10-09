import { SCALE_MAX } from '../../../../shared/protocol';

/** Horizontal position of a scale value on the bar, inset so 0 and the top tick stay inside the rounded ends. */
export function scalePos(value: number): string {
  return `${4 + (value / SCALE_MAX) * 92}%`;
}
