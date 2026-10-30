import {notFound} from "next/navigation";
import {solutions,SolutionPage} from "@/components/star/pages";
export function generateStaticParams(){return solutions.map(s=>({id:s.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const s=solutions.find(s=>s.id===id);return {title:s?.title||"Решение не найдено",description:s?.text,alternates:{canonical:`/solutions/${id}`}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const s=solutions.find(s=>s.id===id);if(!s)notFound();return <SolutionPage solution={s}/>;}
