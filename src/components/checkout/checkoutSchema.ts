import { z } from "zod";

export const checkoutSchema = z
  .object({
    name: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(80, "Nombre demasiado largo"),
    phone: z
      .string()
      .regex(/^\d{9}$/, "Ingresa un número de 9 dígitos"),
    deliveryType: z.enum(["delivery", "pickup"]),
    address: z.string().optional(),
    notes: z.string().max(200, "Máximo 200 caracteres").optional(),
    paymentMethod: z.enum(["yape", "cash"]),
  })
  .refine(
    (data) => data.deliveryType === "pickup" || (data.address && data.address.length >= 5),
    {
      message: "Ingresa una dirección válida",
      path: ["address"],
    },
  );

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
