import {siteConfig} from "@/config/site";
export function GET(){const rules=siteConfig.published?"Allow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /privacy":"Disallow: /";return new Response(`User-agent: *\n${rules}\nSitemap: ${siteConfig.origin}/sitemap.xml\n`,{headers:{"Content-Type":"text/plain; charset=utf-8"}});}
