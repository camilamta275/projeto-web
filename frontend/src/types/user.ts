export type PerfilUsuario = 'Cidadão' | 'Gestor' | 'Admin'

export interface Usuario {
  id: string
  nome: string
  email: string
  cpf?: string
  perfil: PerfilUsuario
  orgaoId?: string
  status: 'Ativo' | 'Inativo'
  criadoEm: string
}

export interface ManagerProfile {
  id: string;
  fullName: string;
  displayName: string;
  initials: string;
  role: string;
  email: string;
  registration: string;
  organization: string;
  department: string;
  avatarUrl?: string;
  stats: {
    managedTickets: number;
    avgResolutionHours: number;
    slaCompliancePct: number;
  };
  notifications: NotificationPref[];
}

export interface NotificationPref {
  id: string;
  label: string;
  email: boolean;
  system: boolean;
}

