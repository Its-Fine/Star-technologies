import { validRate } from "./money";
import { InputError, validateFields, validateAttachment, boundedFormData } from "./lead-validation";

export type StarEnv = {
  DB?: D1Database;
  // BUCKET больше не требуется
  ADMIN_TOKEN?: string;
  CRM_WEBHOOK_URL?: string;
  CRM_WEBHOOK_TOKEN?: string;
  USD_RUB_RATE?: string;
  RATE_LIMIT_SALT?: string;
};

export type LeadRow = {
  id: string;
  request_key: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  product: string;
  currency: string;
  created_at: number;
  consent_version: string;
  attachment_key: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  attachment_data: string | null; // <-- Новое поле для Base64
  crm_status: string;
};

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function authorize(request: Request, env: StarEnv) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([digest(token), digest(env.ADMIN_TOKEN)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function readRate(env: StarEnv) {
  const row = await env.DB?.prepare("SELECT value FROM settings WHERE key = ?").bind("usd_rub").first<{ value: string }>();
  return validRate(row?.value ?? env.USD_RUB_RATE);
}

export async function forwardLead(env: StarEnv, lead: LeadRow) {
  if (!env.CRM_WEBHOOK_URL || !env.DB) return false;
  let endpoint: URL;
  try { endpoint = new URL(env.CRM_WEBHOOK_URL); } catch { return false; }
  if (endpoint.protocol !== "https:") return false;

  const { attachment_key, request_key, attachment_data, ...payload } = lead;
  void attachment_key; void request_key; void attachment_data;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": lead.id,
        ...(env.CRM_WEBHOOK_TOKEN ? { "Authorization": `Bearer ${env.CRM_WEBHOOK_TOKEN}` } : {})
      },
      body: JSON.stringify({
        source: "star-technologies",
        lead: payload,
        attachmentDownloadPath: lead.attachment_data ? `/api/admin/leads/${lead.id}/attachment` : null
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!result.ok) throw new Error("CRM rejected request");
    await env.DB.prepare("UPDATE leads SET crm_status = ? WHERE id = ?").bind("sent", lead.id).run();
    return true;
  } catch {
    await env.DB.prepare("UPDATE leads SET crm_status = ? WHERE id = ?").bind("error", lead.id).run();
    return false;
  }
}

export async function createLead(request: Request, env: StarEnv) {
  if (!sameOrigin(request)) return json({ error: "Недопустимый источник запроса." }, 403);
  if (!env.DB) return json({ error: "Приём заявок ещё не настроен. Попробуйте позже." }, 503);

  let requestKey: string | undefined;
  try {
    const ip = request.headers.get("cf-connecting-ip") || "local";
    const window = Math.floor(Date.now() / 3600000);
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${env.RATE_LIMIT_SALT || env.ADMIN_TOKEN || "star"}:${ip}:${window}`)));
    const key = Array.from(hash).map(n => n.toString(16).padStart(2, "0")).join("");
    
    const count = await env.DB.prepare("INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(key, (window + 2) * 3600000).first<{ count: number }>();
    if ((count?.count || 0) > 20) return json({ error: "Слишком много запросов. Попробуйте позже." }, 429);
    await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(Date.now()).run();

    const form = await boundedFormData(request);
    const input = validateFields(form);
    requestKey = input.requestKey;

    const existing = await env.DB.prepare("SELECT id FROM leads WHERE request_key = ?").bind(requestKey).first<{ id: string }>();
    if (existing) return json({ id: existing.id }, 200);

    const raw = form.get("attachment");
    if (raw !== null && typeof raw === "string") throw new InputError("Проверьте прикреплённый файл.");
    const file = raw && typeof raw !== "string" && raw.name ? (raw as unknown as File) : null;
    const info = file ? await validateAttachment(file) : null;

    const id = `ST-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 12).replaceAll("-", "").toUpperCase()}`;
    
    let attachmentData: string | null = null;
    if (file && info) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      attachmentData = btoa(binary); // Кодируем в Base64
    }

    await env.DB.prepare(`
      INSERT INTO leads (id, request_key, name, company, email, phone, location, message, product, currency, created_at, consent_version, attachment_key, attachment_name, attachment_type, attachment_size, attachment_data, crm_status) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      id, input.requestKey, input.name, input.company, input.email, input.phone, input.location, input.message, input.product, input.currency, Date.now(), "2026-10-11-draft", 
      null, info?.name ?? null, info?.type ?? null, info?.size ?? null, attachmentData, env.CRM_WEBHOOK_URL ? "pending" : "disabled"
    ).run();

    if (env.CRM_WEBHOOK_URL) {
      const lead = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();
      if (lead) await forwardLead(env, lead);
    }
    return json({ id }, 201);
  } catch (error) {
    if (error instanceof InputError) return json({ error: error.message }, error.status);
    if (requestKey) {
      try {
        const saved = await env.DB.prepare("SELECT id FROM leads WHERE request_key = ?").bind(requestKey).first<{ id: string }>();
        if (saved) return json({ id: saved.id }, 200);
      } catch {}
    }
    return json({ error: "Не удалось сохранить заявку. Проверьте соединение и повторите отправку." }, 500);
  }
}

export async function adminLeads(request: Request, env: StarEnv) {
  if (!await authorize(request, env)) return json({ error: "Доступ закрыт. Нужен ключ администратора." }, 401);
  if (!env.DB) return json({ error: "Хранилище не подключено." }, 503);
  
  const url = new URL(request.url);
  const before = Number(url.searchParams.get("before")) || Date.now() + 1;
  const { results } = await env.DB.prepare("SELECT * FROM leads WHERE created_at < ? ORDER BY created_at DESC LIMIT 100").bind(before).all<LeadRow>();
  
  return json({
    leads: results.map(({ attachment_data, request_key, ...lead }) => ({ ...lead, hasAttachment: !!attachment_data })),
    nextBefore: results.length === 100 ? results[99].created_at : null
  });
}

export async function adminSettings(request: Request, env: StarEnv) {
  if (!await authorize(request, env)) return json({ error: "Доступ закрыт." }, 401);
  if (!env.DB) return json({ error: "Хранилище не подключено." }, 503);
  
  if (request.method === "GET") return json({ usdRub: await readRate(env), crmConfigured: !!env.CRM_WEBHOOK_URL });
  if (!sameOrigin(request)) return json({ error: "Недопустимый источник." }, 403);
  
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json({ error: "Некорректные данные." }, 400); }
  
  const rate = validRate(data.usdRub);
  if (rate === null) return json({ error: "Курс должен быть положительным числом." }, 400);
  
  await env.DB.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").bind("usd_rub", String(rate), Date.now()).run();
  return json({ usdRub: rate });
}

export async function adminAttachment(request: Request, env: StarEnv, id: string) {
  if (!await authorize(request, env)) return json({ error: "Доступ закрыт." }, 401);
  if (!env.DB) return json({ error: "Хранилище не подключено." }, 503);

  const lead = await env.DB.prepare("SELECT attachment_data, attachment_name, attachment_type FROM leads WHERE id=?").bind(id).first<{ attachment_data: string | null, attachment_name: string | null, attachment_type: string | null }>();
  
  if (!lead?.attachment_data) return json({ error: "Файл не найден." }, 404);

  // Декодируем Base64 обратно в бинарные данные
  const binaryString = atob(lead.attachment_data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Response(bytes, {
    headers: {
      "Content-Type": lead.attachment_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(lead.attachment_name || "attachment")}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox"
    }
  });
}

export async function adminRetry(request: Request, env: StarEnv, id: string) {
  if (!await authorize(request, env)) return json({ error: "Доступ закрыт." }, 401);
  if (!sameOrigin(request)) return json({ error: "Недопустимый источник." }, 403);
  if (!env.CRM_WEBHOOK_URL || !env.DB) return json({ error: "CRM ещё не подключена." }, 503);
  
  const lead = await env.DB.prepare("SELECT * FROM leads WHERE id=?").bind(id).first<LeadRow>();
  if (!lead) return json({ error: "Заявка не найдена." }, 404);
  
  return json({ sent: await forwardLead(env, lead) });
}