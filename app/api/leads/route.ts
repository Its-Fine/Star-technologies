import {env} from "cloudflare:workers";
import {createLead,type StarEnv} from "@/lib/server";
export async function POST(request:Request){return createLead(request,env as StarEnv);}
