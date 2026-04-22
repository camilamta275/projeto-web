import { create } from 'zustand';
import { ManagerProfile } from '@/types/user';

interface ManagerProfileState {
  profile: ManagerProfile;
  updateNotificationPref(id: string, channel: "email" | "system", value: boolean): void;
  changePassword(current: string, next: string, confirm: string): Promise<void>;
  updateAvatar(file: File): Promise<void>;
}

const useManagerProfileStore = create<ManagerProfileState>((set) => ({
  profile: {
    id: '1',
    fullName: 'João da Silva Gestor',
    displayName: 'João Gestor',
    initials: 'JG',
    role: 'Gestor de Setor',
    email: 'joao@prefeitura.gov.br',
    registration: 'PMR-2024-001',
    organization: 'Prefeitura Municipal do Recife',
    department: 'Obras e Infraestrutura',
    stats: {
      managedTickets: 47,
      avgResolutionHours: 18,
      slaCompliancePct: 89,
    },
    notifications: [
      { id: '1', label: 'Novo chamado no setor', email: true, system: true },
      { id: '2', label: 'SLA próximo do vencimento', email: true, system: true },
      { id: '3', label: 'SLA encerrado', email: true, system: true },
      { id: '4', label: 'Chamado transferido', email: false, system: true },
    ],
  },
  updateNotificationPref: (id, channel, value) => {
    set((state) => ({
      profile: {
        ...state.profile,
        notifications: state.profile.notifications.map((pref) =>
          pref.id === id ? { ...pref, [channel]: value } : pref
        ),
      },
    }));
  },
  changePassword: (current, next, confirm) => {
    return new Promise((resolve, reject) => {
      if (!current || !next || !confirm) {
        return reject('Todos os campos são obrigatórios.');
      }
      if (next.length < 8) {
        return reject('A nova senha deve ter no mínimo 8 caracteres.');
      }
      if (next !== confirm) {
        return reject('A nova senha e a confirmação não conferem.');
      }
      if (next === current) {
        return reject('A nova senha deve ser diferente da senha atual.');
      }
      // Simulate API call
      setTimeout(() => {
        console.log('Password changed successfully');
        resolve();
      }, 1000);
    });
  },
  updateAvatar: (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject('Nenhum arquivo selecionado.');
      // Simulate API call & get URL
      setTimeout(() => {
        const newAvatarUrl = URL.createObjectURL(file);
        set((state) => ({
          profile: {
            ...state.profile,
            avatarUrl: newAvatarUrl,
          },
        }));
        resolve();
      }, 1000);
    });
  },
}));

export default useManagerProfileStore;
