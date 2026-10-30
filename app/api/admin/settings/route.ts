import {env} from "cloudflare:workers";
import {adminSettings,type StarEnv} from "@/lib/server";
export async function GET(request:Request){return adminSettings(request,env as StarEnv);}
export async function PUT(request:Request){return adminSettings(request,env as StarEnv);}
