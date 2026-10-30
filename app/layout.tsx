import type {Metadata} from "next";
import {SiteProvider} from "@/components/star/context";
import {Header,Footer} from "@/components/star/shell";
import {siteConfig} from "@/config/site";
import "./globals.css";
export const metadata: Metadata = {metadataBase:new URL(siteConfig.origin),title:{default:"STAR Technologies — оборудование для ЦОД и серверных",template:"%s | STAR Technologies"},description:siteConfig.description,robots:{index:siteConfig.published,follow:siteConfig.published},openGraph:{title:"STAR Technologies",description:siteConfig.description,locale:"ru_RU",type:"website",images:[{url:"/images/og.png",width:1200,height:630}]},icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body><SiteProvider><a href="#main" className="skip-link">Перейти к содержимому</a><Header/>{children}<Footer/></SiteProvider></body></html>;}
