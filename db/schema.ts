import {sqliteTable,text,integer} from "drizzle-orm/sqlite-core";
export const leads=sqliteTable("leads",{
 id:text("id").primaryKey(),requestKey:text("request_key").notNull().unique(),name:text("name").notNull(),company:text("company").notNull(),email:text("email").notNull(),phone:text("phone").notNull(),location:text("location").notNull(),message:text("message").notNull(),product:text("product").notNull(),currency:text("currency").notNull(),createdAt:integer("created_at").notNull(),consentVersion:text("consent_version").notNull(),attachmentKey:text("attachment_key"),attachmentName:text("attachment_name"),attachmentType:text("attachment_type"),attachmentSize:integer("attachment_size"),crmStatus:text("crm_status").notNull().default("disabled")
});
export const settings=sqliteTable("settings",{key:text("key").primaryKey(),value:text("value").notNull(),updatedAt:integer("updated_at").notNull()});
export const rateLimits=sqliteTable("rate_limits",{key:text("key").primaryKey(),count:integer("count").notNull(),expiresAt:integer("expires_at").notNull()});
