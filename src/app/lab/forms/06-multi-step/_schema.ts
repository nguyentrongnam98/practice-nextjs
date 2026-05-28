import { z } from 'zod'

export const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
})

export const step2Schema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
})

export const fullSchema = step1Schema.merge(step2Schema)
export type WizardState = Partial<z.infer<typeof fullSchema>>
