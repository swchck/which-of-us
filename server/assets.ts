import express, { type RequestHandler } from 'express';
import { readdirSync } from 'node:fs';
import { extname } from 'node:path';

const ENCODINGS = [
  { name: 'br', ext: '.br' },
  { name: 'gzip', ext: '.gz' },
] as const;

/**
 * Serves Vite's hashed build assets with a one-year immutable cache, preferring the
 * .br/.gz siblings written at build time so no request pays for compression.
 */
export function assetsHandler(dir: string): RequestHandler {
  const files = new Set(readdirSync(dir));
  const statics = express.static(dir, { index: false, maxAge: '1y', immutable: true });
  return (req, res, next) => {
    const name = req.path.slice(1);
    const available = ENCODINGS.filter((e) => files.has(name + e.ext));
    if (available.length === 0) return statics(req, res, next);
    res.vary('Accept-Encoding');
    const chosen = req.acceptsEncodings(available.map((e) => e.name));
    const encoding = available.find((e) => e.name === chosen);
    if (!encoding) return statics(req, res, next);
    // set before sendFile: send only derives Content-Type when none is present, and it would say .br
    res.type(extname(name)).setHeader('Content-Encoding', encoding.name);
    // with `root`, send checks only the relative part for dotfiles; an absolute path under ~/.something 404'd
    res.sendFile(name + encoding.ext, { root: dir, maxAge: '1y', immutable: true }, (err) => {
      if (err) next(err);
    });
  };
}
