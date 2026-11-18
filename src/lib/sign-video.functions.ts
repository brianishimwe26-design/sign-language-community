import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { buildSignQuery, searchSchema, sourceSchema, trimSchema } from './sign-language';
import { gateway, replicateClient, trimVideo } from './sign-video.server';

const idSchema = z.object({ id: z.string().uuid() });

export const searchSigns = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(searchSchema).handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase.from('sign_video_jobs').insert({ user_id: context.userId, phrase: data.phrase, language: data.language }).select('id').single();
    if (error || !job) throw new Error('Could not save the video search.');
    try {
      const response = await gateway('firecrawl', 'FIRECRAWL_API_KEY', '/v2/search', { method: 'POST', body: JSON.stringify({ query: buildSignQuery(data.phrase, data.language), limit: 5 }) });
      const result = z.object({ success: z.boolean(), data: z.object({ web: z.array(sourceSchema).optional() }).optional(), error: z.string().optional() }).parse(await response.json());
      if (!result.success) throw new Error(result.error ?? 'Search failed.');
      const sources = (result.data?.web ?? []).filter((source) => source.url.startsWith('https://'));
      const { error: updateError } = await context.supabase.from('sign_video_jobs').update({ status: 'awaiting_clip', sources }).eq('id', job.id);
      if (updateError) throw new Error('Could not save search results.');
      return { id: job.id, sources };
    } catch (error) {
      await context.supabase.from('sign_video_jobs').update({ status: 'paused', error: error instanceof Error ? error.message : 'Search failed.' }).eq('id', job.id);
      throw error;
    }
  });

export const trimSign = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(trimSchema).handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase.from('sign_video_jobs').update({ status: 'trimming', lease_until: new Date(Date.now() + 300000).toISOString() })
      .eq('id', data.id).eq('user_id', context.userId).eq('status', 'awaiting_clip').select('id').maybeSingle();
    if (error || !job) throw new Error('This clip is already processing or is unavailable.');
    const uploadPath = `${context.userId}/${data.id}/source.mp4`;
    try {
      const { data: signed, error: signError } = await context.supabase.storage.from('sign-videos').createSignedUrl(uploadPath, 600);
      if (signError || !signed) throw new Error('Upload a permitted reference video first.');
      const clip = await trimVideo(signed.signedUrl, data.start, data.end, data.id);
      const path = `${context.userId}/${data.id}/clip.mp4`;
      const { error: uploadError } = await context.supabase.storage.from('sign-videos').upload(path, clip, { contentType: 'video/mp4' });
      if (uploadError) throw new Error('Could not save the trimmed clip.');
      const { error: updateError } = await context.supabase.from('sign_video_jobs').update({ status: 'clip_ready', clip_path: path, start_seconds: data.start, end_seconds: data.end, lease_until: null }).eq('id', data.id);
      if (updateError) throw new Error('Could not save clip progress.');
      return { id: data.id };
    } catch (error) {
      await context.supabase.from('sign_video_jobs').update({ status: 'paused', error: error instanceof Error ? error.message : 'Trimming failed.', lease_until: null }).eq('id', data.id);
      throw error;
    }
  });

export const animateSign = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(idSchema).handler(async ({ data, context }) => {
    const { data: job } = await context.supabase.from('sign_video_jobs').update({ status: 'starting_animation', lease_until: new Date(Date.now() + 60000).toISOString() })
      .eq('id', data.id).eq('user_id', context.userId).eq('status', 'clip_ready').select('clip_path').maybeSingle();
    if (!job?.clip_path) throw new Error('The clip is not ready, or animation already started.');
    try {
      const clip = await context.supabase.storage.from('sign-videos').createSignedUrl(job.clip_path, 3600);
      const characterPath = `${context.userId}/${data.id}/character.png`;
      const character = await context.supabase.storage.from('sign-videos').createSignedUrl(characterPath, 3600);
      if (!clip.data || !character.data) throw new Error('The reference clip or character image is missing.');
      const prediction = await replicateClient().predictions.create({ model: 'wan-video/wan-2.2-animate-animation', input: {
        video: clip.data.signedUrl, character_image: character.data.signedUrl, resolution: '480', frames_per_second: 24, merge_audio: false,
      } });
      const { error } = await context.supabase.from('sign_video_jobs').update({ status: 'animating', prediction_id: prediction.id, character_path: characterPath, lease_until: null }).eq('id', data.id);
      if (error) throw new Error('Animation may have started, but progress could not be saved. Do not resend.');
      return { id: data.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Animation failed.';
      console.error('Replicate animation failed', message);
      await context.supabase.from('sign_video_jobs').update({ status: 'paused', error: message.includes('402') ? 'Replicate has insufficient credit. Check Replicate billing.' : 'Animation could not start. Check the connection; do not automatically resend.', lease_until: null }).eq('id', data.id);
      throw new Error(message.includes('402') ? 'Replicate has insufficient credit. Check Replicate billing.' : 'Animation could not start. Check the connection before trying again.');
    }
  });

export const getSignJob = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(idSchema).handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase.from('sign_video_jobs').select('*').eq('id', data.id).eq('user_id', context.userId).single();
    if (error || !job) throw new Error('Video request not found.');
    if (job.status === 'animating' && job.prediction_id) {
      try {
        const prediction = await replicateClient().predictions.get(job.prediction_id);
        if (prediction.status === 'failed' || prediction.status === 'canceled') {
          await context.supabase.from('sign_video_jobs').update({ status: 'paused', error: 'Animation failed or was canceled. No automatic retry was made.' }).eq('id', job.id);
          job.status = 'paused'; job.error = 'Animation failed or was canceled.';
        } else if (prediction.status === 'succeeded') {
          const output = z.string().url().parse(prediction.output);
          const { data: locked } = await context.supabase.from('sign_video_jobs').update({ status: 'saving', lease_until: new Date(Date.now() + 60000).toISOString() }).eq('id', job.id).eq('status', 'animating').select('id').maybeSingle();
          if (locked) {
            const url = new URL(output);
            if (url.protocol !== 'https:' || !(url.hostname === 'replicate.delivery' || url.hostname.endsWith('.replicate.delivery'))) throw new Error('Unexpected animation download location.');
            const response = await fetch(output);
            if (!response.ok) throw new Error('Could not download the finished animation.');
            const blob = await response.blob();
            if (blob.size > 50 * 1024 * 1024) throw new Error('Animation exceeds the storage limit.');
            const outputPath = `${context.userId}/${job.id}/animation.mp4`;
            const { error: uploadError } = await context.supabase.storage.from('sign-videos').upload(outputPath, blob, { contentType: 'video/mp4' });
            if (uploadError) throw new Error('Could not save animation.');
            const { error: saveError } = await context.supabase.from('sign_video_jobs').update({ status: 'completed', output_path: outputPath, lease_until: null }).eq('id', job.id);
            if (saveError) throw new Error('Could not save animation progress.');
            job.status = 'completed'; job.output_path = outputPath;
          }
        }
      } catch (error) {
        console.error('Animation status failed', error);
        await context.supabase.from('sign_video_jobs').update({ status: 'paused', error: 'Could not check or save animation. Processing is paused; no new animation was requested.', lease_until: null }).eq('id', job.id);
        job.status = 'paused'; job.error = 'Could not check or save animation.';
      }
    }
    const path = job.output_path ?? job.clip_path;
    const signed = path ? await context.supabase.storage.from('sign-videos').createSignedUrl(path, 3600) : null;
    return { id: job.id, status: job.status, error: job.error, videoUrl: signed?.data?.signedUrl ?? null };
  });