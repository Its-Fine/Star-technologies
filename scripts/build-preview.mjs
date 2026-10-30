import {createRequire} from "node:module";
import {readFile,writeFile,readdir,mkdir} from "node:fs/promises";
import path from "node:path";
const require=createRequire(import.meta.url);
const esbuild=require(require.resolve("esbuild",{paths:[require.resolve("drizzle-kit")]}));
const result=await esbuild.build({entryPoints:["preview/entry.tsx"],bundle:true,write:false,format:"iife",platform:"browser",minify:true,jsx:"automatic",alias:{"@":process.cwd()},define:{"process.env.NODE_ENV":'"production"'},logLevel:"silent"});
const assets={};for(const name of await readdir("public/images")){if(name.endsWith(".svg")&&name!=="og.svg")assets["/images/"+name]="data:image/svg+xml;base64,"+(await readFile(path.join("public/images",name))).toString("base64");}
// Same product components and CSS as the deployed application. No separate mockup.
const css=(await readFile("app/globals.css","utf8")).replace('@import "tailwindcss";','');
let initial=await readFile("outputs/home-ssr.html","utf8");for(const [src,data] of Object.entries(assets))initial=initial.replaceAll(src,data);
const html=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>STAR Technologies — предварительный просмотр</title><style>${css}</style></head><body><div id="root"><div class="preview-banner"><strong>STAR Technologies · первая версия</strong>Автономный просмотр. Сайт не опубликован; заявки здесь не отправляются.</div>${initial}</div><noscript>Для интерактивного просмотра включите JavaScript.</noscript><script>window.STAR_ASSETS=${JSON.stringify(assets)};</script><script>${result.outputFiles[0].text.replaceAll("</script","<\\/script")}</script></body></html>`;
await mkdir("deliverables",{recursive:true});await writeFile("deliverables/STAR_Technologies_preview.html",html);console.log(`Offline preview: ${Math.round(Buffer.byteLength(html)/1024)} KB; ${Object.keys(assets).length} inline assets; no deployment.`);
