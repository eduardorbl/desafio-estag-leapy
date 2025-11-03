'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Tipos
 */
type TalentItem = {
  id: string;
  department: string | null;
  current_status: string | null;
  pdi_plan_ready: boolean | null;
  orchestrator_state: string | null;
  date_updated: string | null;
  date_created: string | null;
  user_id?: { email?: string | null };
  start_date?: string | null;
  end_date?: string | null;
  phone_number?: string | null;
  current_cycle?: number | null;
  leader_id?: { user_id?: { email?: string | null } } | null;
  target_role_id?: { name?: string | null } | null;
};

type TalentsResponse = {
  data?: TalentItem[];
  meta?: { filter_count?: number } & Record<string, unknown>;
  errors?: { message: string }[];
};

/**
 * Ícones
 */
const IconSearch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
    />
  </svg>
);

const IconAlert = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
    />
  </svg>
);

/**
 * Helpers
 */
const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR');
};

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function isValidLimit(value: number): value is (typeof LIMIT_OPTIONS)[number] {
  return LIMIT_OPTIONS.includes(value as (typeof LIMIT_OPTIONS)[number]);
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : fallback;
}

function parseLimit(value: string | null) {
  const parsed = parsePositiveInt(value, DEFAULT_LIMIT);
  return isValidLimit(parsed) ? parsed : DEFAULT_LIMIT;
}

function parseSortOrder(value: string | null): 'asc' | 'desc' {
  return value === 'asc' || value === 'desc' ? value : 'desc';
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    const { name } = error as { name?: string };
    return name === 'AbortError';
  }

  return false;
}

/**
 * Componente Principal
 */
export default function TalentsPage() {
  // Estados de filtro
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [pdi, setPdi] = useState('');
  const [orchestrator, setOrchestrator] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dados
  const [items, setItems] = useState<TalentItem[]>([]);
  const [total, setTotal] = useState(0);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sincronização com URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setQ(params.get('q')!);
    if (params.get('department')) setDepartment(params.get('department')!);
    if (params.get('status')) setStatus(params.get('status')!);
    if (params.get('pdi')) setPdi(params.get('pdi')!);
    if (params.get('orchestrator')) setOrchestrator(params.get('orchestrator')!);
    if (params.get('startDate')) setStartDate(params.get('startDate')!);
    if (params.get('endDate')) setEndDate(params.get('endDate')!);
    if (params.get('leaderId')) setLeaderId(params.get('leaderId')!);
    if (params.get('targetRoleId')) setTargetRoleId(params.get('targetRoleId')!);
    const urlPage = params.get('page');
    if (urlPage !== null) setPage(parsePositiveInt(urlPage, DEFAULT_PAGE));
    const urlLimit = params.get('limit');
    if (urlLimit !== null) setLimit(parseLimit(urlLimit));
    const urlSort = params.get('sort');
    if (urlSort !== null) setSortOrder(parseSortOrder(urlSort));
  }, []);

  // Atualizar URL quando filtros mudarem
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const normalizedPage = Number.isFinite(page) ? Math.max(DEFAULT_PAGE, Math.floor(page)) : DEFAULT_PAGE;
    const normalizedLimit = isValidLimit(limit) ? limit : DEFAULT_LIMIT;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (department) params.set('department', department);
    if (status) params.set('status', status);
    if (pdi) params.set('pdi', pdi);
    if (orchestrator) params.set('orchestrator', orchestrator);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (leaderId) params.set('leaderId', leaderId);
    if (targetRoleId) params.set('targetRoleId', targetRoleId);
    if (normalizedPage > DEFAULT_PAGE) params.set('page', String(normalizedPage));
    if (normalizedLimit !== DEFAULT_LIMIT) params.set('limit', String(normalizedLimit));
    if (sortOrder !== 'desc') params.set('sort', sortOrder);
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [q, department, status, pdi, orchestrator, startDate, endDate, leaderId, targetRoleId, page, limit, sortOrder]);

  // Debounce da busca
  const qDebounced = useDebouncedValue(q, 400);

  // Fetch de dados
  useEffect(() => {
    const hasValidLimit = isValidLimit(limit);
    const normalizedLimit = hasValidLimit ? limit : DEFAULT_LIMIT;
    const normalizedPage = Number.isFinite(page) ? Math.max(DEFAULT_PAGE, Math.floor(page)) : DEFAULT_PAGE;

    if (!hasValidLimit) {
      setLimit(normalizedLimit);
      return;
    }

    if (normalizedPage !== page) {
      setPage(normalizedPage);
      return;
    }

    const abort = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL('/api/talents', window.location.origin);

        url.searchParams.set('page', String(normalizedPage));
        url.searchParams.set('limit', String(normalizedLimit));

        if (qDebounced) url.searchParams.set('q', qDebounced);
        if (department) url.searchParams.set('department', department);
        if (status) url.searchParams.set('current_status', status);
        if (pdi) url.searchParams.set('pdi_plan_ready', pdi);
        if (orchestrator) url.searchParams.set('orchestrator_state', orchestrator);
        if (startDate) url.searchParams.set('start_date_gte', startDate);
        if (endDate) url.searchParams.set('end_date_lte', endDate);
        if (leaderId) url.searchParams.set('leader_id', leaderId);
        if (targetRoleId) url.searchParams.set('target_role_id', targetRoleId);
        url.searchParams.set('sort', sortOrder === 'desc' ? '-date_updated' : 'date_updated');

        const response = await fetch(url.toString(), {
          signal: abort.signal,
          cache: 'no-store',
        });

        const json: TalentsResponse = await response.json();

        if (!response.ok) {
          throw new Error(json?.errors?.[0]?.message || `HTTP ${response.status}`);
        }

        setItems(json.data ?? []);
        const newTotal = json.meta?.filter_count ?? 0;
        setTotal(newTotal);

        // Auto-ajuste de página se necessário
        const newTotalPages = Math.max(1, Math.ceil(newTotal / normalizedLimit));
        if (normalizedPage > newTotalPages) {
          setPage(newTotalPages);
        }
      } catch (err: unknown) {
        if (isAbortError(err)) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();

    return () => abort.abort();
  }, [
    page,
    limit,
    qDebounced,
    department,
    status,
    pdi,
    orchestrator,
    startDate,
    endDate,
    leaderId,
    targetRoleId,
    sortOrder,
  ]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage((prev) => (prev !== DEFAULT_PAGE ? DEFAULT_PAGE : prev));
  }, [qDebounced, department, status, pdi, orchestrator, startDate, endDate, leaderId, targetRoleId]);

  const totalPages = useMemo(() => {
    const safeLimit = isValidLimit(limit) ? limit : DEFAULT_LIMIT;
    return Math.max(1, Math.ceil(total / safeLimit));
  }, [total, limit]);

  // Opções de filtros (valores internos → labels traduzidos)
  const departments = [
    { value: 'Design', label: 'Design' },
    { value: 'Engineering', label: 'Engenharia' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operações' },
    { value: 'Product', label: 'Produto' },
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'ONBOARDING', label: 'Em integração' },
    { value: 'PENDING_FIRST_ACCESS', label: 'Aguardando primeiro acesso' },
  ];

  const orchestrators = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'ONBOARDING', label: 'Em integração' },
    { value: 'PENDING', label: 'Pendente' },
    { value: '_null', label: 'Sem orchestrador' },
  ];

  const pdiOptions = [
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' },
  ];

  // Leader IDs (1-20 baseado no seed)
  const leaderOptions = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        value: String(i + 1),
        label: `Líder ${i + 1}`,
      })),
    []
  );

  // Target Role IDs (1-10 baseado no seed)
  const targetRoleOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        value: String(i + 1),
        label: `Cargo ${i + 1}`,
      })),
    []
  );

  const handleClearFilters = () => {
    setQ('');
    setDepartment('');
    setStatus('');
    setPdi('');
    setOrchestrator('');
    setStartDate('');
    setEndDate('');
    setLeaderId('');
    setTargetRoleId('');
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const url = new URL('/api/talents', window.location.origin);
      url.searchParams.set('limit', '10000'); // Export all filtered results
      
      if (qDebounced) url.searchParams.set('q', qDebounced);
      if (department) url.searchParams.set('department', department);
      if (status) url.searchParams.set('current_status', status);
      if (pdi) url.searchParams.set('pdi_plan_ready', pdi);
      if (orchestrator) url.searchParams.set('orchestrator_state', orchestrator);
      if (startDate) url.searchParams.set('start_date_gte', startDate);
      if (endDate) url.searchParams.set('end_date_lte', endDate);
      if (leaderId) url.searchParams.set('leader_id', leaderId);
      if (targetRoleId) url.searchParams.set('target_role_id', targetRoleId);
      url.searchParams.set('sort', sortOrder === 'desc' ? '-date_updated' : 'date_updated');

      const response = await fetch(url.toString());
      const json: TalentsResponse = await response.json();
      
      if (!response.ok || !json.data) {
        throw new Error('Erro ao exportar dados');
      }

      // Gerar CSV
      const headers = [
        'Email',
        'Telefone',
        'Departamento',
        'Status',
        'Orchestrator',
        'PDI',
        'Ciclo',
        'Data Início',
        'Data Fim',
        'Líder',
        'Cargo Alvo',
        'Atualizado em'
      ];

      const rows = json.data.map((t) => [
        t.user_id?.email ?? '',
        t.phone_number ?? '',
        t.department ?? '',
        t.current_status ?? '',
        t.orchestrator_state ?? '',
        t.pdi_plan_ready ? 'Sim' : 'Não',
        t.current_cycle ?? '',
        formatDate(t.start_date),
        formatDate(t.end_date),
        t.leader_id?.user_id?.email ?? '',
        t.target_role_id?.name ?? '',
        formatDateTime(t.date_updated)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `talentos-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao exportar';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Gerenciamento de Talentos
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sistema de busca e filtragem de colaboradores
          </p>

          {/* Busca */}
          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por e-mail (ex.: talent001@leapy.com)"
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-500/20 transition text-slate-900 placeholder:text-slate-400"
                aria-label="Buscar por e-mail"
              />
            </div>

            <div className="flex items-center justify-end gap-3 flex-wrap">
              <span 
                className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-900"
                role="status"
                aria-live="polite"
              >
                {total.toLocaleString()} resultado{total !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="limit-select" className="text-sm font-medium text-slate-700">
                  Por página:
                </label>
                <select
                  id="limit-select"
                  value={limit}
                  onChange={(e) => {
                    const nextLimit = Number(e.target.value);
                    setLimit(isValidLimit(nextLimit) ? nextLimit : DEFAULT_LIMIT);
                    setPage(DEFAULT_PAGE);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-500/20 transition"
                  aria-label="Itens por página"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={isExporting || loading || total === 0}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Exportar resultados para CSV"
              >
                {isExporting ? 'Exportando...' : 'Exportar CSV'}
              </button>
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 underline transition"
                aria-label="Limpar todos os filtros"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Departamento"
              value={department}
              onChange={setDepartment}
              options={departments}
            />
            <Select label="Status" value={status} onChange={setStatus} options={statuses} />
            <Select
              label="Orchestrator"
              value={orchestrator}
              onChange={setOrchestrator}
              options={orchestrators}
            />
            <Select
              label="PDI pronto?"
              value={pdi}
              onChange={setPdi}
              options={pdiOptions}
            />

            <DateInput
              label="Data de Início (a partir de)"
              value={startDate}
              onChange={setStartDate}
            />
            <DateInput label="Data de Fim (até)" value={endDate} onChange={setEndDate} />
            <Select
              label="Líder"
              value={leaderId}
              onChange={setLeaderId}
              options={leaderOptions}
            />
            <Select
              label="Cargo Alvo"
              value={targetRoleId}
              onChange={setTargetRoleId}
              options={targetRoleOptions}
            />
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Erro */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
            <IconAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar dados</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div 
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          role="region"
          aria-label="Tabela de talentos"
          aria-busy={loading}
        >
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Orchestrator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    PDI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Ciclo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Início
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Fim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Líder
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Cargo Alvo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    aria-sort={sortOrder === 'desc' ? 'descending' : 'ascending'}
                  >
                    <button
                      type="button"
                      onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-label={`Ordenar por data de atualização (${sortOrder === 'desc' ? 'mais recente primeiro' : 'mais antiga primeiro'})`}
                    >
                      Atualizado
                      <span className="text-blue-600" aria-hidden="true">
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-sm text-slate-500">
                      Nenhum resultado encontrado
                    </td>
                  </tr>
                ) : (
                  items.map((talent) => <TableRow key={talent.id} talent={talent} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-slate-200">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Nenhum resultado encontrado
              </div>
            ) : (
              items.map((talent) => <Card key={talent.id} talent={talent} />)
            )}
          </div>
        </div>

        {/* Paginação */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(DEFAULT_PAGE, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onGoto={(p) => setPage(Math.max(DEFAULT_PAGE, Math.min(p, totalPages)))}
        />
      </section>
    </main>
  );
}

/**
 * Subcomponentes - Tabela
 */
function TableRow({ talent }: { talent: TalentItem }) {
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-4 py-3 text-sm text-slate-900">{talent.user_id?.email ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{talent.phone_number ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{talent.department ?? '—'}</td>
      <td className="px-4 py-3">
        <Badge variant={getBadgeVariant(talent.current_status)}>
          {talent.current_status ?? '—'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="blue">{talent.orchestrator_state ?? '—'}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={talent.pdi_plan_ready ? 'green' : 'gray'}>
          {talent.pdi_plan_ready ? 'Sim' : 'Não'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{talent.current_cycle ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{formatDate(talent.start_date)}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{formatDate(talent.end_date)}</td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {talent.leader_id?.user_id?.email ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{talent.target_role_id?.name ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{formatDateTime(talent.date_updated)}</td>
    </tr>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 12 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Subcomponentes - Card Mobile
 */
function Card({ talent }: { talent: TalentItem }) {
  return (
    <article className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {talent.user_id?.email ?? '—'}
            </p>
            <p className="text-xs text-slate-600 mt-1">{talent.phone_number ?? '—'}</p>
          </div>
          <Badge variant={getBadgeVariant(talent.current_status)}>
            {talent.current_status ?? '—'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoItem label="Departamento" value={talent.department ?? '—'} />
          <InfoItem label="Orchestrator" value={talent.orchestrator_state ?? '—'} />
          <InfoItem label="PDI" value={talent.pdi_plan_ready ? 'Sim' : 'Não'} />
          <InfoItem label="Ciclo" value={String(talent.current_cycle ?? '—')} />
          <InfoItem label="Início" value={formatDate(talent.start_date)} />
          <InfoItem label="Fim" value={formatDate(talent.end_date)} />
          <InfoItem
            label="Líder"
            value={talent.leader_id?.user_id?.email ?? '—'}
            className="col-span-2"
          />
          <InfoItem
            label="Cargo Alvo"
            value={talent.target_role_id?.name ?? '—'}
            className="col-span-2"
          />
          <InfoItem
            label="Atualizado"
            value={formatDateTime(talent.date_updated)}
            className="col-span-2 text-[10px]"
          />
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded bg-slate-50 px-2 py-1.5', className)}>
      <span className="text-slate-600">{label}: </span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function CardSkeleton() {
  return (
    <article className="p-4">
      <div className="space-y-3">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Subcomponentes - Badge
 */
function Badge({
  children,
  variant = 'gray',
}: {
  children: React.ReactNode;
  variant?: 'green' | 'gray' | 'red' | 'blue' | 'orange';
}) {
  const variants = {
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-slate-100 text-slate-800 border-slate-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}

function getBadgeVariant(status?: string | null): 'green' | 'gray' | 'red' | 'orange' {
  if (!status) return 'gray';
  if (status === 'ACTIVE') return 'green';
  if (status === 'INACTIVE') return 'red';
  if (status === 'ONBOARDING') return 'orange';
  return 'gray';
}

/**
 * Subcomponentes - Inputs
 */
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useStableId(label);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-500/20 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useStableId(label);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-500/20 transition"
      />
    </div>
  );
}

/**
 * Subcomponentes - Paginação
 */
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onGoto,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoto: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const result = new Set<number>();
    result.add(DEFAULT_PAGE);
    result.add(totalPages);

    for (let p = page - 1; p <= page + 1; p++) {
      if (p >= DEFAULT_PAGE && p <= totalPages) result.add(p);
    }

    return Array.from(result).sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={page <= DEFAULT_PAGE}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Anterior
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && pages[i - 1] + 1 !== p && (
              <span className="px-2 text-slate-400">…</span>
            )}
            <button
              onClick={() => onGoto(p)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition border',
                p === page
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              )}
            >
              {p}
            </button>
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Próxima
      </button>
    </nav>
  );
}

/**
 * Hooks
 */
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useStableId(seed: string) {
  return useMemo(() => seed.replace(/\s+/g, '-').toLowerCase(), [seed]);
}
