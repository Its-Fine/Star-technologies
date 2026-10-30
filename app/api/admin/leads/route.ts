import {env} from "cloudflare:workers";
import {adminLeads,type StarEnv} from "@/lib/server";
export async function GET(request:Request){return adminLeads(request,env as StarEnv);}
