-- Seed fixado (idempotente)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============== ROLES (10) ===============
-- Evita duplicar pela coluna "name"
WITH g AS (
  SELECT generate_series(1, 10) AS n
)
INSERT INTO public.target_roles (name, description)
SELECT 'Role ' || n, 'Descrição para Role ' || n
FROM g
WHERE NOT EXISTS (
  SELECT 1 FROM public.target_roles r WHERE r.name = 'Role ' || g.n
);

-- =============== LÍDERES (20) ===============
-- 1) cria 20 usuários determinísticos (leader01..20)
WITH src AS (
  SELECT
    gs AS n,
    ('leader' || LPAD(gs::TEXT, 2, '0') || '@example.com') AS email
  FROM generate_series(1, 20) AS gs
),
ins_users AS (
  INSERT INTO public.directus_users (id, email)
  SELECT gen_random_uuid(), s.email
  FROM src s
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id, email
),
u AS (
  SELECT id, email, ROW_NUMBER() OVER (ORDER BY email) AS rn
  FROM ins_users
)
-- 2) insere leaders usando os MESMOS UUIDs, se ainda não existirem
INSERT INTO public.internship_leaders
  (status, phone_number, user_id, position, department)
SELECT
  'active' AS status,
  '+5511' || LPAD((rn + 9000000000)::TEXT, 11, '0') AS phone_number,
  id AS user_id,
  CASE (rn % 4)
    WHEN 0 THEN 'Manager'
    WHEN 1 THEN 'Lead'
    WHEN 2 THEN 'Senior'
    ELSE 'Coordinator'
  END AS position,
  CASE (rn % 5)
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END AS department
FROM u
WHERE NOT EXISTS (
  SELECT 1 FROM public.internship_leaders il WHERE il.user_id = u.id
);

-- =============== TALENTS (100) ===============
-- 1) cria 100 usuários determinísticos (talent0001..0100)
WITH src AS (
  SELECT
    gs AS n,
    ('talent' || LPAD(gs::TEXT, 4, '0') || '@example.com') AS email
  FROM generate_series(1, 100) AS gs
),
ins_users AS (
  INSERT INTO public.directus_users (id, email)
  SELECT gen_random_uuid(), s.email
  FROM src s
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id, email
),
u AS (
  SELECT id, email, ROW_NUMBER() OVER (ORDER BY email) AS rn
  FROM ins_users
),
leaders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM public.internship_leaders
),
roles AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM public.target_roles
),
totals AS (
  SELECT
    (SELECT COUNT(*) FROM leaders) AS n_leaders,
    (SELECT COUNT(*) FROM roles)   AS n_roles
)
INSERT INTO public.talents (
  id, date_created, date_updated, user_id, phone_number, start_date, end_date,
  target_role_id, leader_id, department, current_status, orchestrator_state,
  pdi_plan_ready, current_cycle
)
SELECT
  gen_random_uuid() AS id,
  NOW() - (random() * INTERVAL '90 days')  AS date_created,
  NOW() - (random() * INTERVAL '30 days')  AS date_updated,
  u.id                                     AS user_id,
  '+5511' || LPAD((u.rn + 9900000000)::TEXT, 11, '0') AS phone_number,
  CURRENT_DATE - (random() * INTERVAL '180 days')      AS start_date,
  CURRENT_DATE + (random() * INTERVAL '180 days')      AS end_date,

  r.id AS target_role_id,
  l.id AS leader_id,

  CASE ((u.rn - 1) % 5)
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END AS department,

  CASE ((u.rn - 1) % 4)
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'PENDING_FIRST_ACCESS'
    WHEN 2 THEN 'INACTIVE'
    ELSE 'ONBOARDING'
  END AS current_status,

  CASE ((u.rn - 1) % 4)
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'ONBOARDING'
    WHEN 2 THEN 'PENDING'
    ELSE NULL
  END AS orchestrator_state,

  ( ((u.rn - 1) % 2) = 0 ) AS pdi_plan_ready,
  (1 + ((u.rn - 1) % 3))   AS current_cycle
FROM u
CROSS JOIN totals t
JOIN roles   r ON r.rn = ( ((u.rn - 1) % GREATEST(t.n_roles,   1)) + 1 )
JOIN leaders l ON l.rn = ( ((u.rn - 1) % GREATEST(t.n_leaders, 1)) + 1 )
WHERE NOT EXISTS (
  SELECT 1 FROM public.talents tt WHERE tt.user_id = u.id
);

-- =============== CONFIGURAR TOKEN ESTÁTICO DO ADMIN ===============
-- Configura o token estático no usuário admin para facilitar o setup
-- Este token NÃO expira e permite que o frontend funcione imediatamente
UPDATE public.directus_users
SET token = '257iLTe36i_fZoM6Ok97i4x3RcHcFHGF'
WHERE email = 'admin@example.com';
