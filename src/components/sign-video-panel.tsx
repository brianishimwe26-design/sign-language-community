import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ExternalLink, Film, Loader2, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from './account-provider';
import { useSignLanguage } from './sign-language-provider';
import { searchSigns, trimSign, animateSign, getSignJob } from '@/lib/sign-video.functions';
import type { SignSource } from '@/lib/sign-language';
import character from '@/assets/signa-character.png.asset.json';

export function SignVideoPanel({ phrase, onVideo }: { phrase: string; onVideo: (url: string | null) => void }) {
  const { user } = useAccount();
  const { language } = useSignLanguage();
  const search = useServerFn(searchSigns);
  const trim = useServerFn(trimSign);
  const animate = useServerFn(animateSign);
  const check = useServerFn(getSignJob);
  const [id, setId] = useState<string | null>(null);
  const [sources, setSources] = useState<SignSource[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(3);
  const [rights, setRights] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const busy = ['searching', 'trimming', 'starting_animation', 'animating', 'saving'].includes(status);
  useEffect(() => {
    if (!id || status !== 'animating') return;
    const timer = window.setTimeout(async () => {
      try {
        const job = await check({ data: { id } });
        setStatus(job.status);
        if (job.error) setError(job.error);
        if (job.status === 'completed' && job.videoUrl) onVideo(job.videoUrl);
      } catch (error) { setStatus('paused'); setError(error instanceof Error ? error.message : 'Could not check animation.'); }
    }, 10000);
    return () => clearTimeout(timer);
  }, [id, status, check, onVideo]);
  // A separate tick ensures nonterminal status checks continue without starting more predictions.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (status !== 'animating') return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), 12000);
    return () => clearTimeout(timer);
  }, [status, tick]);
  useEffect(() => {
    if (!id || status !== 'animating' || tick === 0) return;
    void check({ data: { id } }).then((job) => {
      setStatus(job.status); if (job.error) setError(job.error);
      if (job.status === 'completed' && job.videoUrl) onVideo(job.videoUrl);
    }).catch((error: unknown) => { setStatus('paused'); setError(error instanceof Error ? error.message : 'Could not check animation.'); });
  }, [tick]);

  async function find() {
    setError(''); setStatus('searching'); onVideo(null); setSources([]); setId(null);
    try { const result = await search({ data: { phrase, language } }); setId(result.id); setSources(result.sources); setStatus('awaiting_clip'); }
    catch (error) { setStatus('paused'); setError(error instanceof Error ? error.message : 'Search failed.'); }
  }
  async function cut() {
    if (!id || !user || !file || !rights) return;
    setError(''); setStatus('trimming');
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('Choose a video smaller than 50 MB.');
      const { error } = await supabase.storage.from('sign-videos').upload(`${user.id}/${id}/source.mp4`, file, { contentType: file.type || 'video/mp4' });
      if (error) throw new Error('Could not upload the reference video.');
      await trim({ data: { id, start, end, rightsConfirmed: true } });
      const job = await check({ data: { id } }); setStatus(job.status);
    } catch (error) { setStatus('paused'); setError(error instanceof Error ? error.message : 'Trimming failed.'); }
  }
  async function createAnimation() {
    if (!id || !user) return;
    setStatus('starting_animation'); setError('');
    try {
      const response = await fetch(character.url);
      if (!response.ok) throw new Error('Character image could not load.');
      const { error } = await supabase.storage.from('sign-videos').upload(`${user.id}/${id}/character.png`, await response.blob(), { contentType: 'image/png' });
      if (error) throw new Error('Could not prepare the character image.');
      await animate({ data: { id } }); setStatus('animating');
    } catch (error) { setStatus('paused'); setError(error instanceof Error ? error.message : 'Animation failed.'); }
  }
  return <div className="space-y-4 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-muted-foreground">{language}</span><Button onClick={find} disabled={!user || busy || !phrase}><Film className="h-4 w-4" />Find sign video</Button></div>
    {!user && <a href="/login" className="text-primary underline">Sign in to find and animate videos</a>}
    {busy && <p role="status" className="flex items-center gap-2 text-primary"><Loader2 className="h-4 w-4 animate-spin" />{status === 'searching' ? 'Finding references…' : status === 'trimming' ? 'Trimming the clip…' : 'Animating your character…'}</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {status !== 'searching' && id && <>
      <ul className="space-y-2">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-primary"><ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />{source.title}</a></li>)}</ul>
      {!sources.length && <p className="text-muted-foreground">No matching references found for this language.</p>}
      {status === 'awaiting_clip' && <div className="space-y-3 border-t border-border pt-4">
        <label className="block space-y-2"><span>Reference video</span><input aria-label="Reference video" type="file" accept="video/mp4,video/webm,video/quicktime" className="block max-w-full text-muted-foreground" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
        <div className="grid grid-cols-2 gap-3">{[['Start (seconds)', start, setStart], ['End (seconds)', end, setEnd]].map(([label, value, setter]) => <label key={String(label)} className="space-y-1"><span>{String(label)}</span><input type="number" min="0" step="0.1" value={Number(value)} aria-label={String(label)} onChange={(event) => { if (typeof setter === 'function') setter(Number(event.target.value)); }} className="w-full rounded-md border border-input bg-background px-3 py-2" /></label>)}</div>
        <label className="flex items-start gap-2"><input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} className="mt-1 accent-primary" /><span>I have permission to reuse this video and selected the correct sign.</span></label>
        <Button onClick={cut} disabled={!file || !rights || end <= start}><Film className="h-4 w-4" />Trim selected clip</Button>
      </div>}
      {status === 'clip_ready' && <><p className="text-muted-foreground">Clip ready. Animation uses Replicate credits and needs sign-language review.</p><Button onClick={createAnimation}><WandSparkles className="h-4 w-4" />Animate character</Button></>}
      {status === 'completed' && <p className="text-muted-foreground">Generated animation — not yet reviewed for signing accuracy.</p>}
    </>}
  </div>;
}