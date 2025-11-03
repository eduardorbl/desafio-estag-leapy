-- Fase 1: tabelas + índices (sem as FKs cíclicas)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- internship_leaders
-- =========================
CREATE TABLE IF NOT EXISTS public.internship_leaders (
  id            SERIAL                  NOT NULL,
  status        VARCHAR(255)            NOT NULL DEFAULT 'draft',
  date_created  TIMESTAMPTZ             NULL,
  date_updated  TIMESTAMPTZ             NULL,
  date_deleted  TIMESTAMP               NULL,
  phone_number  VARCHAR(255)            NOT NULL,
  user_id       UUID                    NOT NULL,
  position      VARCHAR(255)            NULL,
  department    VARCHAR(255)            NULL,
  CONSTRAINT internship_leaders_pkey PRIMARY KEY (id),
  CONSTRAINT internship_leaders_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES public.directus_users (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS internship_leaders_status_idx
  ON public.internship_leaders USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS internship_leaders_department_idx
  ON public.internship_leaders USING btree (department) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS internship_leaders_user_id_idx
  ON public.internship_leaders USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS internship_leaders_phone_idx
  ON public.internship_leaders USING btree (phone_number) TABLESPACE pg_default;

-- =========================
-- talents
-- =========================
CREATE TABLE IF NOT EXISTS public.talents (
  id                     UUID           NOT NULL,
  date_created           TIMESTAMPTZ    NULL,
  date_updated           TIMESTAMPTZ    NULL,
  date_deleted           TIMESTAMP      NULL,
  user_id                UUID           NOT NULL,
  phone_number           VARCHAR(255)   NOT NULL,
  start_date             TIMESTAMP      NULL,
  end_date               TIMESTAMP      NULL,
  graduation_course      VARCHAR(255)   NULL,
  graduation_institution VARCHAR(255)   NULL,
  target_role_id         INTEGER        NULL,  -- FK cíclica (fase 2)
  leader_id              INTEGER        NULL,
  department             VARCHAR(255)   NULL,
  current_status         VARCHAR(255)   NULL DEFAULT 'PENDING_FIRST_ACCESS',
  last_status_change_at  TIMESTAMP      NULL,
  verified_phone_number  VARCHAR(255)   NULL,
  orchestrator_state     VARCHAR(50)    NULL DEFAULT NULL,
  reset_count            INTEGER        NOT NULL DEFAULT 0,
  last_reset_at          TIMESTAMP      NULL,
  pdi_plan_ready         BOOLEAN        NULL DEFAULT FALSE,
  current_cycle          INTEGER        NOT NULL DEFAULT 1,
  current_cycle_id       UUID           NULL,
  CONSTRAINT talents_pkey PRIMARY KEY (id),
  CONSTRAINT talents_phone_number_unique UNIQUE (phone_number),
  CONSTRAINT talents_user_id_unique      UNIQUE (user_id),
  CONSTRAINT talents_leader_id_foreign
    FOREIGN KEY (leader_id) REFERENCES public.internship_leaders (id) ON DELETE SET NULL,
  CONSTRAINT talents_user_id_foreign
    FOREIGN KEY (user_id)   REFERENCES public.directus_users (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS talents_user_id_idx
  ON public.talents USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS talents_department_idx
  ON public.talents USING btree (department) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS talents_leader_id_idx
  ON public.talents USING btree (leader_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS talents_date_range_idx
  ON public.talents USING btree (start_date, end_date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_talents_orchestrator_state
  ON public.talents USING btree (orchestrator_state) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_talents_reset_count
  ON public.talents USING btree (reset_count) TABLESPACE pg_default;

-- ⚠️ Este é o índice parcial: sem TABLESPACE (ele teria que vir antes do WHERE)
CREATE INDEX IF NOT EXISTS idx_talents_pdi_plan_ready
  ON public.talents USING btree (pdi_plan_ready)
  WHERE (pdi_plan_ready = TRUE);

-- Pode existir mesmo antes da FK cíclica:
CREATE INDEX IF NOT EXISTS talents_target_role_id_idx
  ON public.talents USING btree (target_role_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS talents_phone_idx
  ON public.talents USING btree (phone_number) TABLESPACE pg_default;

-- =========================
-- target_roles
-- =========================
CREATE TABLE IF NOT EXISTS public.target_roles (
  id                    SERIAL          NOT NULL,
  date_created          TIMESTAMPTZ     NULL,
  date_updated          TIMESTAMPTZ     NULL,
  date_deleted          TIMESTAMPTZ     NULL,
  name                  VARCHAR(255)    NOT NULL,
  description           TEXT            NULL,
  important_skills      JSON            NULL,
  success_criteria      VARCHAR(255)    NULL,
  talent_id             UUID            NULL,  -- FK cíclica (fase 2)
  required_skills       JSON            NULL,
  talent_current_skills JSON            NULL,
  match                 REAL            NULL DEFAULT 0,
  CONSTRAINT target_roles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
