import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import selfsigned from 'selfsigned';

export interface Tls {
  key: string;
  cert: string;
}

interface Stored extends Tls {
  ip: string;
  expires: number;
}

const VALID_DAYS = 825;
const RENEW_BEFORE_MS = 30 * 24 * 3600_000;

/**
 * Self-signed certificate for the LAN HTTPS listener. Phones accept it once, so it is kept
 * on disk and reused until the LAN address changes or it nears expiry.
 */
export async function loadOrCreateCert(dataDir: string, ip: string): Promise<Tls> {
  const file = join(dataDir, 'tls.json');
  const previous = await readFile(file, 'utf8')
    .then((text) => JSON.parse(text) as Stored)
    .catch(() => null);
  if (previous && previous.ip === ip && previous.expires - Date.now() > RENEW_BEFORE_MS) {
    return { key: previous.key, cert: previous.cert };
  }

  const notBeforeDate = new Date(Date.now() - 24 * 3600_000);
  const notAfterDate = new Date(notBeforeDate.getTime() + VALID_DAYS * 24 * 3600_000);
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'Кто из нас?' }], {
    keyType: 'ec',
    curve: 'P-256',
    algorithm: 'sha256',
    notBeforeDate,
    notAfterDate,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 7, ip },
          { type: 7, ip: '127.0.0.1' },
          { type: 2, value: 'localhost' },
        ],
      },
    ],
  });
  const stored: Stored = { key: pems.private, cert: pems.cert, ip, expires: notAfterDate.getTime() };
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(stored), { mode: 0o600 });
  return { key: stored.key, cert: stored.cert };
}
