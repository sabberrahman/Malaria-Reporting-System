-- Public branch: allow anonymous read-only access to reporting registers
-- and the location hierarchy used by local_records joins.

CREATE POLICY "Anon can read districts" ON public.districts
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read upazilas" ON public.upazilas
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read unions" ON public.unions
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read villages" ON public.villages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read local records" ON public.local_records
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can read non-local records" ON public.non_local_records
  FOR SELECT TO anon
  USING (true);
