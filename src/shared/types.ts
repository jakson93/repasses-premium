import z from "zod";

export const MotorcycleSchema = z.object({
  id: z.number(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  color: z.string().nullable(),
  mileage: z.number().nullable(),
  displacement: z.number().nullable(),
  price: z.number().nullable(),
  description: z.string().nullable(),
  condition: z.string().nullable(),
  payment_methods: z.string().nullable(),
  features: z.string().nullable(),
  is_featured: z.number().int(),
  is_financed: z.number().int(),
  is_overdue: z.number().int(),
  finance_days_remaining: z.number().nullable(),
  finance_monthly_payment: z.number().nullable(),
  finance_total_remaining: z.number().nullable(),
  is_worth_financing: z.number().int(),
  thumbnail_url: z.string().nullable(),
  created_at: z.string(),
  status: z.string().nullable(), // Adicionado status
  updated_at: z.string(),
});

export type Motorcycle = z.infer<typeof MotorcycleSchema> & {
  images: { id: number; url: string; filename: string; name: string }[]; // Adicionado name
};

export const MotorcycleImageSchema = z.object({
  id: z.number(),
  motorcycle_id: z.number(),
  image_url: z.string(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MotorcycleImage = z.infer<typeof MotorcycleImageSchema>;

export const CreateMotorcycleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  color: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  displacement: z.number().int().min(0).optional(),
  price: z.number().min(0),
  description: z.string().optional(),
  condition: z.string().optional(),
  payment_methods: z.string().optional(),
  features: z.string().optional(),
  status: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_financed: z.boolean().optional(),
  is_overdue: z.boolean().optional(),
  finance_days_remaining: z.number().int().optional(),
  finance_monthly_payment: z.number().optional(),
  finance_total_remaining: z.number().optional(),
  is_worth_financing: z.boolean().optional(),
});

export type CreateMotorcycle = z.infer<typeof CreateMotorcycleSchema>;

export const UpdateMotorcycleSchema = CreateMotorcycleSchema.partial();

export type UpdateMotorcycle = z.infer<typeof UpdateMotorcycleSchema>;

export const MotorcycleFiltersSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minMileage: z.number().optional(),
  maxMileage: z.number().optional(),
  minDisplacement: z.number().optional(),
  maxDisplacement: z.number().optional(),
  condition: z.string().optional(),
  is_financed: z.boolean().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'year_asc', 'year_desc', 'newest']).optional(),
});

export type MotorcycleFilters = z.infer<typeof MotorcycleFiltersSchema>;


