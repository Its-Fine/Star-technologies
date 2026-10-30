import {createRequire} from "node:module";
import {mkdir} from "node:fs/promises";
import {spawnSync} from "node:child_process";
const require=createRequire(import.meta.url);const esbuild=require(require.resolve("esbuild",{paths:[require.resolve("drizzle-kit")]}));await mkdir("outputs",{recursive:true});
for(const [name,entry]of [["integration","tests/integration.ts"],["render","tests/render.tsx"]]){const outfile=`outputs/${name}-check.mjs`;await esbuild.build({entryPoints:[entry],outfile,bundle:true,platform:"node",format:"esm",packages:"external",alias:{"@":process.cwd()},jsx:"automatic",logLevel:"silent"});const result=spawnSync(process.execPath,[outfile],{stdio:"inherit"});if(result.status!==0)process.exit(result.status||1);}
