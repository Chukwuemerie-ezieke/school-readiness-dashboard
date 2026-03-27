-- ============================================================
-- Harmony Digital Consults Ltd — School Readiness Dashboard
-- Supabase PostgreSQL Migration
-- Run this in the Supabase SQL Editor for your project
-- ============================================================

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- profiles: extends auth.users with app-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'consultant', 'school')),
  school_id UUID,  -- will reference schools(id) after schools table is created
  created_at TIMESTAMPTZ DEFAULT now()
);

-- schools: registered schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  assigned_consultant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add the foreign key for profiles.school_id after schools table exists
ALTER TABLE public.profiles
  ADD CONSTRAINT IF NOT EXISTS profiles_school_id_fkey
  FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- assessments: each assessment session per school
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assessor_id UUID NOT NULL REFERENCES public.profiles(id),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  scores JSONB NOT NULL DEFAULT '{}',
  overall_score NUMERIC(4,3) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Trigger: auto-create profile on user signup ──────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'school')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: auto-update updated_at on assessments
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assessments_updated_at ON public.assessments;
CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── RLS Policies: profiles ───────────────────────────────────────────────────

-- Anyone can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Admins can insert profiles (for invited users)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Allow trigger to insert (service role bypasses RLS)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ─── RLS Policies: schools ────────────────────────────────────────────────────

-- Admins can read all schools
CREATE POLICY "Admins can read all schools"
  ON public.schools FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Consultants can read schools assigned to them
CREATE POLICY "Consultants can read assigned schools"
  ON public.schools FOR SELECT
  USING (
    public.get_my_role() = 'consultant'
    AND assigned_consultant_id = auth.uid()
  );

-- School users can read their own school
CREATE POLICY "School users can read own school"
  ON public.schools FOR SELECT
  USING (
    public.get_my_role() = 'school'
    AND id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can insert/update/delete schools
CREATE POLICY "Admins can insert schools"
  ON public.schools FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update schools"
  ON public.schools FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete schools"
  ON public.schools FOR DELETE
  USING (public.get_my_role() = 'admin');

-- ─── RLS Policies: assessments ───────────────────────────────────────────────

-- Admins can read all assessments
CREATE POLICY "Admins can read all assessments"
  ON public.assessments FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Consultants can read assessments for their schools
CREATE POLICY "Consultants can read assigned school assessments"
  ON public.assessments FOR SELECT
  USING (
    public.get_my_role() = 'consultant'
    AND school_id IN (
      SELECT id FROM public.schools WHERE assigned_consultant_id = auth.uid()
    )
  );

-- School users can read their own assessments (read-only)
CREATE POLICY "School users can read own assessments"
  ON public.assessments FOR SELECT
  USING (
    public.get_my_role() = 'school'
    AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  );

-- Admins and consultants can insert assessments
CREATE POLICY "Admins and consultants can insert assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (
    public.get_my_role() IN ('admin', 'consultant')
    AND assessor_id = auth.uid()
  );

-- Admins and consultants can update assessments
CREATE POLICY "Admins and consultants can update assessments"
  ON public.assessments FOR UPDATE
  USING (
    public.get_my_role() IN ('admin', 'consultant')
    AND assessor_id = auth.uid()
  );

-- Admins can update any assessment
CREATE POLICY "Admins can update any assessment"
  ON public.assessments FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ─── Default Admin User ───────────────────────────────────────────────────────
-- NOTE: The admin user must be created through the Supabase Auth dashboard:
-- 1. Go to Authentication > Users > Add user
-- 2. Enter email: admin@harmonydigi.com (or your preferred admin email)
-- 3. Set a password
-- 4. Run the SQL below to set their role to 'admin' after signup:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@harmonydigi.com';
--
-- Alternatively, to manually insert a placeholder admin profile (the password
-- must still be set through Supabase dashboard or Auth API):
--
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'admin@harmonydigi.com',
--   'Harmony Admin',
--   'admin'
-- ) ON CONFLICT DO NOTHING;

-- ─── Indexes for Performance ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS assessments_school_id_idx ON public.assessments(school_id);
CREATE INDEX IF NOT EXISTS assessments_assessor_id_idx ON public.assessments(assessor_id);
CREATE INDEX IF NOT EXISTS schools_consultant_id_idx ON public.schools(assigned_consultant_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- Run: SELECT * FROM public.profiles LIMIT 5;  -- verify tables exist
