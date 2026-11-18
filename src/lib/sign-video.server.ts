import { Sandbox } from 'e2b';
import Replicate from 'replicate';

export async function gateway(service: string, secretName: string, path: string, init?: RequestInit) {
  const key = process.env[secretName];
  const auth = process.env['LOVABLE_API_KEY'];
  if (!key || !auth) throw new Error(`${service} is not connected.`);
  const response = await fetch(`https://connector-gateway.lovable.dev/${service}${path}`, {
    ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}`, 'X-Connection-Api-Key': key, ...init?.headers },
  });
  if (!response.ok) {
    const details = await response.text();
    console.error(`${service} [${response.status}]: ${details}`);
    if (response.status === 402) throw new Error(`${service} cannot cover this request. Check the connected account’s billing.`);
    if (response.status === 403) throw new Error(`${service} refused access or reached a spending limit. Check the connection before trying again.`);
    throw new Error(`${service} request failed (${response.status}). No automatic retry was made.`);
  }
  return response;
}

export function replicateClient() {
  const auth = process.env['LOVABLE_API_KEY'];
  const key = process.env['REPLICATE_API_KEY'];
  if (!auth || !key) throw new Error('Replicate is not connected.');
  return new Replicate({ auth, baseUrl: 'https://connector-gateway.lovable.dev/replicate/v1',
    fetch: (input, init) => { const headers = new Headers(init?.headers); headers.set('X-Connection-Api-Key', key); return fetch(input, { ...init, headers }); },
  });
}

export async function trimVideo(sourceUrl: string, start: number, end: number, jobId: string) {
  const response = await gateway('udc_e2b', 'UDC_E2B_API_KEY', '/v2/sandboxes', {
    method: 'POST', headers: { 'Idempotency-Key': jobId },
    body: JSON.stringify({ templateID: 'base', timeout: 300, network: { denyOut: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.0/8', '169.254.0.0/16'] } }),
  });
  const { z } = await import('zod');
  const sandboxInfo = z.object({ sandboxID: z.string(), envdVersion: z.string(), envdAccessToken: z.string(), domain: z.string().nullish() }).parse(await response.json());
  // The control plane is gateway-backed; envd uses the sandbox's scoped token, never the provider key.
  const sandbox = new Sandbox({ sandboxId: sandboxInfo.sandboxID, envdVersion: sandboxInfo.envdVersion,
    envdAccessToken: sandboxInfo.envdAccessToken, sandboxDomain: sandboxInfo.domain ?? undefined,
    apiKey: 'sandbox-session', validateApiKey: false, httpVersion: 'http1', retries: 0 });
  try {
    await sandbox.files.write('/home/user/trim.json', JSON.stringify({ url: sourceUrl, start, end }));
    const script = `import json, subprocess, urllib.request, os
c=json.load(open('/home/user/trim.json'))
with urllib.request.urlopen(c['url'], timeout=45) as response:
  with open('/home/user/source.mp4','wb') as out:
    size=0
    while True:
      chunk=response.read(65536)
      if not chunk: break
      size+=len(chunk)
      if size>50*1024*1024: raise RuntimeError('Video exceeds 50 MB')
      out.write(chunk)
subprocess.run(['ffmpeg','-v','error','-i','/home/user/source.mp4','-ss',str(c['start']),'-t',str(c['end']-c['start']),'-an','-vf','scale=640:-2','-c:v','libx264','-movflags','+faststart','-y','/home/user/clip.mp4'],check=True,timeout=90)
`;
    await sandbox.files.write('/home/user/trim.py', script);
    await sandbox.commands.run('sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg && python3 /home/user/trim.py', { timeoutMs: 180000 });
    return await sandbox.files.read('/home/user/clip.mp4', { format: 'bytes' });
  } finally {
    // Kill through the same connector, not the provider API.
    await gateway('udc_e2b', 'UDC_E2B_API_KEY', `/sandboxes/${sandboxInfo.sandboxID}`, { method: 'DELETE' }).catch((error: unknown) => console.error('Sandbox cleanup failed', error));
  }
}