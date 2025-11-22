import z from "zod";

export const fetchImageSchema = z.object({
  imageUrl: z.url(),
});
