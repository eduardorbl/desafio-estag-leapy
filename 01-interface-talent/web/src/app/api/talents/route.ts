import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_STATIC_TOKEN;

  if (!url || !token) {
    return NextResponse.json(
      { ok: false, error: 'Missing DIRECTUS_URL or DIRECTUS_STATIC_TOKEN' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);

  // paginação / busca
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '10';
  const q = searchParams.get('q') ?? '';

  // filtros vindos do front (já existentes na tua UI)
  const department = searchParams.get('department') ?? '';
  const current_status = searchParams.get('current_status') ?? '';
  const pdi_plan_ready = searchParams.get('pdi_plan_ready') ?? ''; // 'true' | 'false' | ''
  const orchestrator_state = searchParams.get('orchestrator_state') ?? '';
  const start_date_gte = searchParams.get('start_date_gte') ?? '';
  const end_date_lte = searchParams.get('end_date_lte') ?? '';
  const leader_id = searchParams.get('leader_id') ?? '';
  const target_role_id = searchParams.get('target_role_id') ?? '';

  // ordenação (default = -date_updated)
  const sort = searchParams.get('sort') ?? '-date_updated';

  const qs = new URLSearchParams();

  // campos + paginação + meta (incluindo campos relacionados)
  qs.set(
    'fields',
    [
      'id',
      'department',
      'current_status',
      'pdi_plan_ready',
      'orchestrator_state',
      'start_date',
      'end_date',
      'date_updated',
      'date_created',
      'phone_number',
      'current_cycle',
      // nomes do usuário
      'user_id.email',
      'user_id.first_name',
      'user_id.last_name',
      // líder
      'leader_id.user_id.email',
      // target role (nome)
      'target_role_id.name',
    ].join(',')
  );
  qs.append('sort[]', sort);
  qs.set('limit', limit);
  qs.set('page', page);
  qs.set('meta', '*');

  // busca por e-mail do usuário relacionado
  if (q) qs.set('filter[user_id][email][_icontains]', q);

  // filtros simples (suporta _null para buscar valores vazios)
  if (department) {
    if (department === '_null') {
      qs.set('filter[department][_null]', 'true');
    } else {
      qs.set('filter[department][_eq]', department);
    }
  }
  if (current_status) {
    if (current_status === '_null') {
      qs.set('filter[current_status][_null]', 'true');
    } else {
      qs.set('filter[current_status][_eq]', current_status);
    }
  }
  if (pdi_plan_ready) {
    if (pdi_plan_ready === '_null') {
      qs.set('filter[pdi_plan_ready][_null]', 'true');
    } else {
      qs.set('filter[pdi_plan_ready][_eq]', pdi_plan_ready); // 'true'/'false'
    }
  }
  if (orchestrator_state) {
    if (orchestrator_state === '_null') {
      qs.set('filter[orchestrator_state][_null]', 'true');
    } else {
      qs.set('filter[orchestrator_state][_eq]', orchestrator_state);
    }
  }

  // intervalo de datas
  if (start_date_gte) qs.set('filter[start_date][_gte]', start_date_gte);
  if (end_date_lte) qs.set('filter[end_date][_lte]', end_date_lte);

  // relacionais por id (suporta _null para buscar valores vazios)
  if (leader_id) {
    if (leader_id === '_null') {
      qs.set('filter[leader_id][_null]', 'true');
    } else {
      qs.set('filter[leader_id][_eq]', leader_id);
    }
  }
  if (target_role_id) {
    if (target_role_id === '_null') {
      qs.set('filter[target_role_id][_null]', 'true');
    } else {
      qs.set('filter[target_role_id][_eq]', target_role_id);
    }
  }

  const directusUrl = `${url}/items/talents?${qs.toString()}`;

  try {
    const res = await fetch(directusUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
