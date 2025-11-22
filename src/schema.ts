import z from "zod";

export const fetchImageSchema = z.object({
  url: z.url(),
});
