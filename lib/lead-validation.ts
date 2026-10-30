export const MAX_FILE_BYTES=10*1024*1024;
export const MAX_BODY_BYTES=MAX_FILE_BYTES+64*1024;
export class InputError extends Error {constructor(message:string,public status=400){super(message);}}
export type LeadInput={name:string;company:string;email:string;phone:string;location:string;message:string;product:string;currency:"RUB"|"USD";requestKey:string};
export function validateFields(form:FormData):LeadInput{
 const field=(name:string,max:number,min=0)=>{const raw=form.get(name);if(raw!==null&&typeof raw!=="string")throw new InputError("Неверный формат поля.");const value=String(raw??"").trim();if(value.length<min||value.length>max)throw new InputError(`Проверьте поле «${({name:"Имя",message:"Описание задачи",email:"Рабочая почта"} as Record<string,string>)[name]||name}».`);return value;};
 if(field("website",200))throw new InputError("Не удалось принять заявку.");
 if(form.get("consent")!=="on")throw new InputError("Подтвердите согласие на обработку данных.");
 const email=field("email",180,5);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new InputError("Укажите корректную рабочую почту.");
 const currency=field("currency",3);if(currency!=="RUB"&&currency!=="USD")throw new InputError("Выберите валюту ₽ или $.");
 const requestKey=field("requestKey",64,16);if(!/^[a-zA-Z0-9-]+$/.test(requestKey))throw new InputError("Обновите страницу и повторите отправку.");
 return {name:field("name",100,2),company:field("company",160),email,phone:field("phone",40),location:field("location",160),message:field("message",6000,10),product:field("product",200),currency,requestKey};
}
export async function validateAttachment(file:File){
 if(file.size===0)throw new InputError("Прикреплённый файл пуст.");
 if(file.size>MAX_FILE_BYTES)throw new InputError("Максимальный размер файла — 10 МБ.",413);
 const ext=file.name.toLowerCase().split(".").pop()||"";
 const mime:Record<string,string>={pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",txt:"text/plain",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png"};
 if(!mime[ext])throw new InputError("Допустимы PDF, DOC(X), XLS(X), TXT, JPG и PNG.");
 const bytes=new Uint8Array(await file.slice(0,8192).arrayBuffer());
 const begins=(expected:number[])=>expected.every((n,i)=>bytes[i]===n);
 const signatures:Record<string,boolean>={pdf:begins([37,80,68,70,45]),doc:begins([208,207,17,224,161,177,26,225]),xls:begins([208,207,17,224,161,177,26,225]),docx:begins([80,75,3,4]),xlsx:begins([80,75,3,4]),jpg:begins([255,216,255]),jpeg:begins([255,216,255]),png:begins([137,80,78,71,13,10,26,10]),txt:!bytes.includes(0)};
 if(!signatures[ext])throw new InputError("Содержимое файла не соответствует расширению.");
 const name=file.name.replace(/[\x00-\x1f\x7f/\\"<>:|?*]/g,"_").slice(0,180);
 return {name,type:mime[ext],size:file.size};
}
export async function boundedFormData(request:Request){
 const len=Number(request.headers.get("content-length")||0);if(len>MAX_BODY_BYTES)throw new InputError("Размер запроса превышает 10 МБ.",413);
 if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))throw new InputError("Ожидается форма с данными.",415);
 const reader=request.body?.getReader();if(!reader)throw new InputError("Пустой запрос.");const chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BODY_BYTES){await reader.cancel();throw new InputError("Размер запроса превышает 10 МБ.",413);}chunks.push(value);}
 const body=new Uint8Array(total);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
 try{return await new Response(body,{headers:{"content-type":request.headers.get("content-type")!}}).formData();}catch{throw new InputError("Не удалось прочитать форму.");}
}
