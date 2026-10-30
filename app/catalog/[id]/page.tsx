import {notFound} from "next/navigation";
import {products} from "@/lib/catalog";
import {ProductPage} from "@/components/star/pages";
export function generateStaticParams(){return products.map(p=>({id:p.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=products.find(p=>p.id===id);return {title:p?.name||"Товар не найден",description:p?.description,alternates:{canonical:`/catalog/${id}`}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=products.find(p=>p.id===id);if(!p)notFound();return <ProductPage product={p}/>;}
