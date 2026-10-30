import {env} from "cloudflare:workers";
import {adminAttachment,type StarEnv} from "@/lib/server";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return adminAttachment(request,env as StarEnv,id);}
