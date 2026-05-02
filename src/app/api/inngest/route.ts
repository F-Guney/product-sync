import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { importProducts } from "@/inngest/functions/import-products";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [importProducts],
});
