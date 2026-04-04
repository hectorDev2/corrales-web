import { z } from "zod";

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
] as const;

export { TIME_SLOTS };

export const reservaSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "Nombre demasiado largo"),
  phone: z.string().regex(/^\d{9}$/, "Ingresa un número de 9 dígitos"),
  date: z
    .string()
    .min(1, "Seleccioná una fecha")
    .refine((val) => new Date(val) >= new Date(new Date().toDateString()), {
      message: "La fecha debe ser hoy o en el futuro",
    }),
  time: z.enum(TIME_SLOTS, { message: "Seleccioná un horario" }),
  guests: z
    .number({ error: "Ingresá un número válido" })
    .int()
    .min(1, "Mínimo 1 persona")
    .max(20, "Máximo 20 personas"),
  notes: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type ReservaFormData = z.infer<typeof reservaSchema>;
