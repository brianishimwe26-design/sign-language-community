CREATE TABLE public.sign_video_jobs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, phrase text NOT NULL, language text NOT NULL, status text NOT NULL DEFAULT 'searching', sources jsonb NOT NULL DEFAULT '[]', source_url text, start_seconds double precision, end_seconds double precision, clip_path text, character_path text, output_path text, prediction_id text, error text, lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.sign_video_jobs TO authenticated;
GRANT ALL ON public.sign_video_jobs TO service_role;
ALTER TABLE public.sign_video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own video jobs" ON public.sign_video_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members create own video jobs" ON public.sign_video_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update own video jobs" ON public.sign_video_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members read own sign media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'sign-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members upload own sign media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sign-videos' AND (storage.foldername(name))[1] = auth.uid()::text);