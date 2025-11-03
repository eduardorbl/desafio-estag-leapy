module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/talents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET(req) {
    const url = process.env.DIRECTUS_URL;
    const token = process.env.DIRECTUS_STATIC_TOKEN;
    if (!url || !token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'Missing DIRECTUS_URL or DIRECTUS_STATIC_TOKEN'
        }, {
            status: 500
        });
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
    qs.set('fields', [
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
        'target_role_id.name'
    ].join(','));
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
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });
        const data = await res.json().catch(()=>({}));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
            status: res.status
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10130a99._.js.map