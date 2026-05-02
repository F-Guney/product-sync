❯ Set up a Next.js 16 App Router project at the current directory using pnpm

1. Initialize: pnpm create next-app . --typescript --tailwind --app --src-dir
   --eslint --import-alias "@/*" (skip turbopack if it asks).
2. Install: prisma @prisma/client @prisma/adapter-neon                        
   @neondatabase/serverless inngest zod, and dev: tsx.
3. Set up shadcn/ui with `pnpm dlx shadcn@latest init -d`, then add: button   
   card table checkbox badge dropdown-menu dialog input label skeleton sonner    
   tabs.
4. Install TanStack Table: pnpm add @tanstack/react-table.
5. Create prisma/schema.prisma exactly as in this Prisma block:               
   model Product {                                                               
   id           Int       @id            // upstream DummyJSON id              
   title        String                                                         
   description  String                                                         
   category     String                                                         
   price        Float                                                          
   rating       Float                                                          
   stock        Int                                                            
   brand        String?                                                        
   sku          String?                                                        
   thumbnail    String?                                                        
   images       String[]                                                       
   tags         String[]                                                       
   raw          Json                     // keep full upstream payload         
   importedAt   DateTime  @default(now())                                      
   updatedAt    DateTime  @updatedAt                                           
   archivedAt   DateTime?                // bulk soft-delete target            
   @@index([category])                                                         
   }

model ImportJob {                                                             
id            String      @id @default(cuid())                              
source        String                                          //            
"dummyjson"                                                                   
status        JobStatus   @default(PENDING)                                 
totalItems    Int?                                                          
processed     Int         @default(0)                                       
failed        Int         @default(0)                                       
chunkSize     Int         @default(30)                                      
startedAt     DateTime?                                                     
finishedAt    DateTime?                                                     
error         String?                                                       
events        ImportEvent[]                                                 
createdBy     String                                          // demo user  
id                                                                            
createdAt     DateTime    @default(now())                                   
}

model ImportEvent {                                                           
id        String     @id @default(cuid())                                   
jobId     String                                                            
job       ImportJob  @relation(fields:[jobId], references:[id], onDelete:   
Cascade)                                                                      
level     String                                              // info |     
warn | error                                                                  
message   String                                                            
meta      Json?                                                             
createdAt DateTime   @default(now())                                        
@@index([jobId, createdAt])                                                 
}

enum JobStatus { PENDING RUNNING SUCCEEDED FAILED PARTIAL }
6. Create src/lib/prisma.ts as a singleton using the Neon adapter (PrismaNeon
+ @neondatabase/serverless), reading DATABASE_URL.
7. Create .env.example with: DATABASE_URL, DATABASE_URL_UNPOOLED,             
   INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, NEXT_PUBLIC_APP_URL.
8. Create prisma/seed.ts that creates a single demo user id constant          
   `DEMO_USER_ID = "demo-user"` (we use it as createdBy for ImportJob — no real  
   auth).
9. Add scripts to package.json: "db:push": "prisma db push", "db:seed": "tsx  
   prisma/seed.ts", "postinstall": "prisma generate", "vercel-build": "prisma    
   generate && prisma migrate deploy && next build", "typecheck": "tsc           
   --noEmit".
10. Set up Sonner toaster in src/app/layout.tsx.

Verify with `pnpm install && pnpm typecheck && pnpm build`. Commit as "feat:  
project skeleton with prisma, neon adapter, shadcn ui".