export function asset(path:string){return typeof window!=="undefined"&&(window as Window&{STAR_ASSETS?:Record<string,string>}).STAR_ASSETS?.[path]||path;}
