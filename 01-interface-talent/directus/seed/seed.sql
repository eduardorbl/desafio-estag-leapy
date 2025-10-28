-- Dados fictícios com ~100 talentos

-- Gerar líderes e roles
insert into public.internship_leaders (status, phone_number, user_id, position, department)
select 
  'active',
  '+5511' || LPAD((ROW_NUMBER() OVER() + 9000000000)::TEXT, 11, '0'),
  gen_random_uuid(),
  CASE (ROW_NUMBER() OVER() % 4)
    WHEN 0 THEN 'Manager'
    WHEN 1 THEN 'Lead'
    WHEN 2 THEN 'Senior'
    ELSE 'Coordinator'
  END,
  CASE (ROW_NUMBER() OVER() % 5)
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END
from generate_series(1, 20)
on conflict do nothing;

insert into public.target_roles (name, description)
select 
  'Role ' || generate_series,
  'Descrição para Role ' || generate_series
from generate_series(1, 10)
on conflict do nothing;

-- 100 talentos
insert into public.talents (
  id, date_created, date_updated, user_id, phone_number, start_date, end_date,
  target_role_id, leader_id, department, current_status, orchestrator_state,
  pdi_plan_ready, current_cycle
)
select 
  gen_random_uuid() as id,
  now() - (random() * interval '90 days') as date_created,
  now() - (random() * interval '30 days') as date_updated,
  gen_random_uuid() as user_id,
  '+5511' || LPAD((ROW_NUMBER() OVER() + 9900000000)::TEXT, 11, '0') as phone_number,
  CURRENT_DATE - (random() * interval '180 days') as start_date,
  CURRENT_DATE + (random() * interval '180 days') as end_date,
  (1 + floor(random() * 10))::INTEGER as target_role_id,
  (1 + floor(random() * 20))::INTEGER as leader_id,
  CASE (floor(random() * 5))
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END as department,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'PENDING_FIRST_ACCESS'
    WHEN 2 THEN 'INACTIVE'
    ELSE 'ONBOARDING'
  END as current_status,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'ONBOARDING'
    WHEN 2 THEN 'PENDING'
    ELSE NULL
  END as orchestrator_state,
  (random() > 0.5) as pdi_plan_ready,
  (1 + floor(random() * 3))::INTEGER as current_cycle
from generate_series(1, 100)
on conflict do nothing;


