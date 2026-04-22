import { z } from 'zod'
import { TicketCategoryEnum, TicketPriorityEnum, UserRoleEnum } from '@/types/enums'

// Validação de Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Validação de Registro
export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRoleEnum).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Validação de Novo Ticket
export const createTicketSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  category: z.nativeEnum(TicketCategoryEnum),
  priority: z.nativeEnum(TicketPriorityEnum),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(10, 'Endereço inválido'),
  images: z.array(z.string().url()).optional(),
})

export type CreateTicketFormData = z.infer<typeof createTicketSchema>

// Validação de Atualização de Ticket
export const updateTicketSchema = createTicketSchema.partial()

export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>

// Validação de Comentário
export const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio').max(1000, 'Comentário muito longo'),
})

export type CommentFormData = z.infer<typeof commentSchema>

// Validação de Edição de Perfil
export const editProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: 'Senha atual é necessária para alterar a senha',
    path: ['currentPassword'],
  },
)

export type EditProfileFormData = z.infer<typeof editProfileSchema>
