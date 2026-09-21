-- ============================================================
-- PUBLIC FORMS
-- Las escrituras se realizan exclusivamente desde la API server-side
-- mediante service_role. No se habilitan INSERT policies para clientes
-- anon/authenticated.
-- ============================================================

create table public.newsletter_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  name       text,
  email      text        not null unique,
  created_at timestamptz not null default now(),
  constraint newsletter_subscriptions_name_length
    check (name is null or char_length(name) between 1 and 100),
  constraint newsletter_subscriptions_email_length
    check (char_length(email) between 3 and 254)
);

create table public.survey_responses (
  id         uuid        primary key default gen_random_uuid(),
  rating     text        not null,
  comments   text,
  created_at timestamptz not null default now(),
  constraint survey_responses_rating_check
    check (rating in ('Excelente', 'Muy buena', 'Buena', 'Puede mejorar')),
  constraint survey_responses_comments_length
    check (comments is null or char_length(comments) <= 2000)
);

create table public.corporate_sales_requests (
  id                       uuid        primary key default gen_random_uuid(),
  first_name               text        not null,
  last_name                text        not null,
  email                    text        not null,
  phone                    text        not null,
  additional_information   text,
  privacy_policy_accepted  boolean     not null default false,
  created_at               timestamptz not null default now(),
  constraint corporate_sales_first_name_length
    check (char_length(first_name) between 2 and 100),
  constraint corporate_sales_last_name_length
    check (char_length(last_name) between 2 and 100),
  constraint corporate_sales_email_length
    check (char_length(email) between 3 and 254),
  constraint corporate_sales_phone_format
    check (phone ~ '^[0-9]{9}$'),
  constraint corporate_sales_information_length
    check (additional_information is null or char_length(additional_information) <= 2000),
  constraint corporate_sales_privacy_policy_check
    check (privacy_policy_accepted)
);

create table public.job_applications (
  id                      uuid        primary key default gen_random_uuid(),
  full_name               text        not null,
  email                   text        not null,
  phone                   text,
  cv_storage_path         text        not null,
  cv_file_name            text        not null,
  cv_content_type         text        not null default 'application/pdf',
  cv_size_bytes           integer     not null,
  privacy_policy_accepted boolean     not null default false,
  created_at              timestamptz not null default now(),
  constraint job_applications_full_name_length
    check (char_length(full_name) between 2 and 150),
  constraint job_applications_email_length
    check (char_length(email) between 3 and 254),
  constraint job_applications_phone_length
    check (phone is null or char_length(phone) between 7 and 20),
  constraint job_applications_cv_content_type_check
    check (cv_content_type = 'application/pdf'),
  constraint job_applications_cv_size_check
    check (cv_size_bytes between 1 and 5242880),
  constraint job_applications_privacy_policy_check
    check (privacy_policy_accepted)
);

alter table public.newsletter_subscriptions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.corporate_sales_requests enable row level security;
alter table public.job_applications enable row level security;

-- Solo administradores autenticados pueden consultar o gestionar los envíos.
create policy "admin: manage newsletter subscriptions"
  on public.newsletter_subscriptions for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "admin: manage survey responses"
  on public.survey_responses for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "admin: manage corporate sales requests"
  on public.corporate_sales_requests for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "admin: manage job applications"
  on public.job_applications for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- El bucket es privado: la API usa service_role para almacenar y eliminar CVs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-applications-cv',
  'job-applications-cv',
  false,
  5242880,
  array['application/pdf']
)
on conflict (id) do nothing;

create policy "admin: read job application cvs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'job-applications-cv'
    and (select public.current_user_role()) = 'admin'
  );
