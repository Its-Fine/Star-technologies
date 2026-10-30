import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {SiteProvider} from "../components/star/context";
import {Header,Footer} from "../components/star/shell";
import {HomePage,CatalogPage,SolutionsPage,SolutionPage,ProductPage,SupplyPage,AboutPage,ContactsPage,PrivacyPage,solutions} from "../components/star/pages";
import {products} from "../lib/catalog";
import NotFound from "../app/not-found";
declare global {interface Window {STAR_ASSETS:Record<string,string>}}
function App(){const [route,setRoute]=useState(location.hash.slice(1)||"/");useEffect(()=>{function routeChanged(){setRoute(location.hash.slice(1)||"/");document.querySelectorAll("dialog[open]").forEach(el=>(el as HTMLDialogElement).close());window.scrollTo(0,0);}function navigate(event:MouseEvent){const a=(event.target as Element).closest("a");const href=a?.getAttribute("href");if(href?.startsWith("/")&&!href.startsWith("//")&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();location.hash=href;}}window.addEventListener("hashchange",routeChanged);document.addEventListener("click",navigate);return()=>{window.removeEventListener("hashchange",routeChanged);document.removeEventListener("click",navigate);};},[]);
 useEffect(()=>{const replace=()=>document.querySelectorAll<HTMLImageElement>('img[src^="/images/"]').forEach(img=>{const value=window.STAR_ASSETS[img.getAttribute("src")||""];if(value)img.src=value;});replace();const observer=new MutationObserver(replace);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();},[route]);
 const path=route.split("?")[0];let page:React.ReactNode=<NotFound/>;
 const pages:Record<string,React.ReactNode>={"/":<HomePage/>,"/catalog":<CatalogPage/>,"/solutions":<SolutionsPage/>,"/supply":<SupplyPage/>,"/about":<AboutPage/>,"/contacts":<ContactsPage/>,"/privacy":<PrivacyPage/>};
 if(pages[path])page=pages[path];else if(path.startsWith("/catalog/")){const p=products.find(p=>p.id===path.split("/")[2]);if(p)page=<ProductPage product={p}/>;}else if(path.startsWith("/solutions/")){const s=solutions.find(s=>s.id===path.split("/")[2]);if(s)page=<SolutionPage solution={s}/>;}
 return <SiteProvider preview><div className="preview-banner"><strong>STAR Technologies · первая версия</strong>Автономный просмотр. Сайт не опубликован; заявки здесь не отправляются.</div><a className="skip-link" href="#main">Перейти к содержимому</a><Header/><div key={route}>{page}</div><Footer/></SiteProvider>;}
createRoot(document.getElementById("root")!).render(<App/>);
