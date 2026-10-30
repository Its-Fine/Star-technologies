import {siteConfig} from "@/config/site";
import {products} from "@/lib/catalog";
const paths=["/","/catalog","/solutions","/supply","/about","/contacts",...products.map(p=>`/catalog/${p.id}`),...["server-room","data-center","compute-storage","modernization"].map(s=>`/solutions/${s}`)];
export function GET(){return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${siteConfig.origin}${path}</loc></url>`).join("")}</urlset>`,{headers:{"Content-Type":"application/xml; charset=utf-8"}});}
