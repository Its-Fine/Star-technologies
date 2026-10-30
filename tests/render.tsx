import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {strict as assert} from "node:assert";
import {existsSync,writeFileSync,mkdirSync} from "node:fs";
import {SiteProvider} from "../components/star/context";
import {Header,Footer} from "../components/star/shell";
import {HomePage,CatalogPage,SolutionsPage,SolutionPage,ProductPage,SupplyPage,AboutPage,ContactsPage,PrivacyPage,solutions} from "../components/star/pages";
import {products} from "../lib/catalog";
const pages:Record<string,React.ReactNode>={"/":<HomePage/>,"/catalog":<CatalogPage/>,"/solutions":<SolutionsPage/>,"/supply":<SupplyPage/>,"/about":<AboutPage/>,"/contacts":<ContactsPage/>,"/privacy":<PrivacyPage/>};for(const p of products)pages[`/catalog/${p.id}`]=<ProductPage product={p}/>;for(const s of solutions)pages[`/solutions/${s.id}`]=<SolutionPage solution={s}/>;
mkdirSync("outputs",{recursive:true});
for(const [path,page]of Object.entries(pages)){const html=renderToStaticMarkup(<SiteProvider><Header/>{page}<Footer/></SiteProvider>);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${path}: one h1`);assert.ok(html.includes('id="main"'));for(const match of html.matchAll(/src="(\/images\/[^\"]+)"/g))assert.ok(existsSync("public"+match[1]),match[1]);for(const match of html.matchAll(/<a\b[^>]*href="(\/[^\"]*)"/g)){const target=match[1].split("?")[0];assert.ok(pages[target],`broken link: ${path} -> ${target}`);}assert.ok(!html.includes("undefined"));if(path==="/")writeFileSync("outputs/home-ssr.html",html);}
console.log(`PASS server rendering, H1, landmarks, assets and links on ${Object.keys(pages).length} public pages.`);
