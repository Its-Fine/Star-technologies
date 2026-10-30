import {env} from "cloudflare:workers";
import {adminRetry,type StarEnv} from "@/lib/server";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return adminRetry(request,env as StarEnv,id);}
