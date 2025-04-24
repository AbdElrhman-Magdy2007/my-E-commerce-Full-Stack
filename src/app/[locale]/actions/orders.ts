"use server"
 
 import db from "@/server/db/db"
 
 export async function userOrderExists(email: string, productId: string) {
   return (
     (await db.order.findFirst({
       where: { user: { email }, productId },
       select: { id: true },
     })) != null
   )
 }