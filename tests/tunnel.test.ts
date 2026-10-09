import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Kind, decode, decodeClose, decodeWs, encode, encodeClose, encodeHead, encodeWs } from '../server/tunnel.js';

interface Vector {
  name: string;
  type: number;
  channel: number;
  frame: string;
  head?: object;
  bytes?: string;
  text?: string;
  code?: number;
  reason?: string;
}

// the relay's Rust codec runs the same file in relay/src/frame.rs
const vectors = JSON.parse(readFileSync(new URL('./tunnel-vectors.json', import.meta.url), 'utf8')) as Vector[];

describe('tunnel frames', () => {
  for (const v of vectors) {
    it(v.name, () => {
      const bytes = Buffer.from(v.frame, 'hex');
      const f = decode(bytes)!;
      expect(f.kind).toBe(v.type);
      expect(f.channel).toBe(v.channel);
      let again: Buffer;
      switch (f.kind) {
        case Kind.Req:
        case Kind.Res:
        case Kind.WsOpen:
          expect(JSON.parse(f.payload.toString())).toEqual(v.head);
          again = encodeHead(f.kind, f.channel, v.head as never);
          break;
        case Kind.WsMsg: {
          const msg = decodeWs(f.payload)!;
          expect(msg.binary).toBe(v.text === undefined);
          expect(msg.binary ? msg.data.toString('hex') : msg.data.toString()).toBe(v.bytes ?? v.text);
          again = encodeWs(f.channel, msg.data, msg.binary);
          break;
        }
        case Kind.WsClose: {
          const close = decodeClose(f.payload)!;
          expect(close).toEqual({ code: v.code, reason: v.reason });
          again = encodeClose(f.channel, close.code, close.reason);
          break;
        }
        case Kind.Reset:
          expect(f.payload.toString()).toBe(v.reason);
          again = encode(f.kind, f.channel, f.payload);
          break;
        default:
          expect(f.payload.toString('hex')).toBe(v.bytes ?? '');
          again = encode(f.kind, f.channel, f.payload);
      }
      expect(again.toString('hex')).toBe(v.frame);
    });
  }

  it('rejects truncated and unknown frames', () => {
    expect(decode(Buffer.from([1, 0, 0, 0]))).toBeNull();
    expect(decode(Buffer.from([99, 0, 0, 0, 1]))).toBeNull();
    expect(decodeWs(Buffer.alloc(0))).toBeNull();
    expect(decodeWs(Buffer.from([2, 1]))).toBeNull();
    expect(decodeClose(Buffer.from([3]))).toBeNull();
  });
});
