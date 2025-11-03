-- Fase 2: adicionar as FKs cíclicas (somente se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'talents_target_role_id_foreign'
  ) THEN
    ALTER TABLE public.talents
      ADD CONSTRAINT talents_target_role_id_foreign
      FOREIGN KEY (target_role_id)
      REFERENCES public.target_roles (id)
      ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'target_roles_talent_id_foreign'
  ) THEN
    ALTER TABLE public.target_roles
      ADD CONSTRAINT target_roles_talent_id_foreign
      FOREIGN KEY (talent_id)
      REFERENCES public.talents (id)
      ON DELETE CASCADE;
  END IF;
END$$;
