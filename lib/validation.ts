import { z } from "zod";

export const marcarAulaSchema = z.object({
  concluida: z.boolean(),
});
