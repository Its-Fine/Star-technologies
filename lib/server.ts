import {validRate} from "./money";
import {InputError,validateFields,validateAttachment,boundedFormData} from "./lead-validation";
export type StarEnv={DB?:D1Database;BUCKET?:R2Bucket;ADMIN_TOKEN?:string;CRM_WEBHOOK_URL?:string;CRM_WEBHOOK_TOKEN?:string;USD_RUB_RATE?:string;RATE_LIMIT_SALT?:string};
export type LeadRow={id:string;request_key:string;name:string;company:string;email:string;phone:string;location:string;message:string;product:string;currency:string;created_at:number;consent_version:string;attachment_key:string|null;attachment_name:string|null;attachment_type:string|null;attachment_size:number|null;crm_status:string};
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin;}
export async function authorize(request:Request,env:StarEnv){
 if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32)return false;
 const token=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 const digest=async(s:string)=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([digest(token),digest(env.ADMIN_TOKEN)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export async function readRate(env:StarEnv){const row=await env.DB?.prepare("SELECT value FROM settings WHERE key = ?").bind("usd_rub").first<{value:string}>();return validRate(row?.value??env.USD_RUB_RATE);}
export async function forwardLead(env:StarEnv,lead:LeadRow){
 if(!env.CRM_WEBHOOK_URL||!env.DB)return false;
 let endpoint:URL;try{endpoint=new URL(env.CRM_WEBHOOK_URL);}catch{return false;}if(endpoint.protocol!=="https:")return false;
 // CRM receives the record and private attachment metadata, never a public file URL.
 const {attachment_key,request_key,...payload}=lead;void attachment_key;void request_key;
 try{const result=await fetch(endpoint,{method:"POST",redirect:"error",headers:{"Content-Type":"application/json","Idempotency-Key":lead.id,...(env.CRM_WEBHOOK_TOKEN?{"Authorization":`Bearer ${env.CRM_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({source:"star-technologies",lead:payload,attachmentDownloadPath:lead.attachment_key?`/api/admin/leads/${lead.id}/attachment`:null}),signal:AbortSignal.timeout(4000)});if(!result.ok)throw new Error("CRM rejected request");await env.DB.prepare("UPDATE leads SET crm_status = ? WHERE id = ?").bind("sent",lead.id).run();return true;}catch{await env.DB.prepare("UPDATE leads SET crm_status = ? WHERE id = ?").bind("error",lead.id).run();return false;}
}
export async function createLead(request:Request,env:StarEnv){
 if(!sameOrigin(request))return json({error:"Недопустимый источник запроса."},403);
 if(!env.DB||!env.BUCKET)return json({error:"Приём заявок ещё не настроен. Попробуйте позже."},503);
 let attachmentKey:string|null=null;let requestKey:string|undefined;
 try{
  const ip=request.headers.get("cf-connecting-ip")||"local";const window=Math.floor(Date.now()/3600000);const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(`${env.RATE_LIMIT_SALT||env.ADMIN_TOKEN||"star"}:${ip}:${window}`)));const key=Array.from(hash).map(n=>n.toString(16).padStart(2,"0")).join("");
  const count=await env.DB.prepare("INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(key,(window+2)*3600000).first<{count:number}>();
  if((count?.count||0)>20)return json({error:"Слишком много запросов. Попробуйте позже."},429);
  await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(Date.now()).run();
  const form=await boundedFormData(request);const input=validateFields(form);requestKey=input.requestKey;
  const existing=await env.DB.prepare("SELECT id FROM leads WHERE request_key = ?").bind(requestKey).first<{id:string}>();if(existing)return json({id:existing.id},200);
  const raw=form.get("attachment");if(raw!==null&&typeof raw==="string")throw new InputError("Проверьте прикреплённый файл.");
  const file=raw&&typeof raw!=="string"&&raw.name?raw as unknown as File:null;const info=file?await validateAttachment(file):null;
  const id=`ST-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,12).replaceAll("-","").toUpperCase()}`;
  if(file&&info){attachmentKey=`leads/${id}/${crypto.randomUUID()}`;await env.BUCKET.put(attachmentKey,await file.arrayBuffer(),{httpMetadata:{contentType:info.type},customMetadata:{leadId:id}});}
  await env.DB.prepare("INSERT INTO leads (id,request_key,name,company,email,phone,location,message,product,currency,created_at,consent_version,attachment_key,attachment_name,attachment_type,attachment_size,crm_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,input.requestKey,input.name,input.company,input.email,input.phone,input.location,input.message,input.product,input.currency,Date.now(),"2026-10-11-draft",attachmentKey,info?.name??null,info?.type??null,info?.size??null,env.CRM_WEBHOOK_URL?"pending":"disabled").run();
  // Once inserted, never remove the attachment on a CRM error.
  attachmentKey=null;
  if(env.CRM_WEBHOOK_URL){const lead=await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();if(lead)await forwardLead(env,lead);}
  return json({id},201);
 }catch(error){
  if(attachmentKey){try{await env.BUCKET.delete(attachmentKey);}catch{}}
  if(error instanceof InputError)return json({error:error.message},error.status);
  // Concurrent retries with the same idempotency key return the saved record.
  if(requestKey){try{const saved=await env.DB.prepare("SELECT id FROM leads WHERE request_key = ?").bind(requestKey).first<{id:string}>();if(saved)return json({id:saved.id},200);}catch{}}
  return json({error:"Не удалось сохранить заявку. Проверьте соединение и повторите отправку."},500);
 }
}
export async function adminLeads(request:Request,env:StarEnv){if(!await authorize(request,env))return json({error:"Доступ закрыт. Нужен ключ администратора."},401);if(!env.DB)return json({error:"Хранилище не подключено."},503);const url=new URL(request.url);const before=Number(url.searchParams.get("before"))||Date.now()+1;const {results}=await env.DB.prepare("SELECT * FROM leads WHERE created_at < ? ORDER BY created_at DESC LIMIT 100").bind(before).all<LeadRow>();return json({leads:results.map(({attachment_key,request_key,...lead})=>({...lead,hasAttachment:!!attachment_key})),nextBefore:results.length===100?results[99].created_at:null});}
export async function adminSettings(request:Request,env:StarEnv){if(!await authorize(request,env))return json({error:"Доступ закрыт."},401);if(!env.DB)return json({error:"Хранилище не подключено."},503);if(request.method==="GET")return json({usdRub:await readRate(env),crmConfigured:!!env.CRM_WEBHOOK_URL});if(!sameOrigin(request))return json({error:"Недопустимый источник."},403);let data:Record<string,unknown>;try{data=await request.json();}catch{return json({error:"Некорректные данные."},400);}const rate=validRate(data.usdRub);if(rate===null)return json({error:"Курс должен быть положительным числом."},400);await env.DB.prepare("INSERT INTO settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind("usd_rub",String(rate),Date.now()).run();return json({usdRub:rate});}
export async function adminAttachment(request:Request,env:StarEnv,id:string){if(!await authorize(request,env))return json({error:"Доступ закрыт."},401);if(!env.DB||!env.BUCKET)return json({error:"Хранилище не подключено."},503);const lead=await env.DB.prepare("SELECT * FROM leads WHERE id=?").bind(id).first<LeadRow>();if(!lead?.attachment_key)return json({error:"Файл не найден."},404);const file=await env.BUCKET.get(lead.attachment_key);if(!file)return json({error:"Файл не найден."},404);return new Response(file.body,{headers:{"Content-Type":"application/octet-stream","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(lead.attachment_name||"attachment")}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});}
export async function adminRetry(request:Request,env:StarEnv,id:string){if(!await authorize(request,env))return json({error:"Доступ закрыт."},401);if(!sameOrigin(request))return json({error:"Недопустимый источник."},403);if(!env.CRM_WEBHOOK_URL||!env.DB)return json({error:"CRM ещё не подключена."},503);const lead=await env.DB.prepare("SELECT * FROM leads WHERE id=?").bind(id).first<LeadRow>();if(!lead)return json({error:"Заявка не найдена."},404);return json({sent:await forwardLead(env,lead)});}
