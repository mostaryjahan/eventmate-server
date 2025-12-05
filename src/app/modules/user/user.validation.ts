import { UserRole } from "@prisma/client";
import z from "zod";
 const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }),
    email: z.string({ error: "Email is required" }),
    password: z.string({error: "Password is required"}).min(6, "Password must be at least 6 characters long"),
    role: z.enum([UserRole.HOST, UserRole.USER]).optional().default(UserRole.USER),
    image: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
});


 const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }),
    password: z.string({error: "Password is required"}).min(6, "Password must be at least 6 characters long"),
    role: z.enum([UserRole.HOST, UserRole.USER]).optional().default(UserRole.USER),
    image: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
});


export { createUserZodSchema ,updateUserZodSchema};