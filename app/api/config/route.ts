import {env} from "cloudflare:workers";
import {json,readRate,type StarEnv} from "@/lib/server";
export async function GET(){try{return json({usdRub:await readRate(env as StarEnv)});}catch{return json({usdRub:null});}}
