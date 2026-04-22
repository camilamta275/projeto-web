import { create } from 'zustand';

// Define the interface for the main entity
interface Demand {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Define the Zustand store interface
interface AppStore {
  demands: Demand[];
  perfilAtivo: 'cidadao' | 'gestor';
  setPerfilAtivo: (perfil: 'cidadao' | 'gestor') => void;
  addRecord: (demand: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, updatedData: Partial<Omit<Demand, 'id' | 'createdAt'>>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => Demand | undefined;
}

// Create the Zustand store
export const useAppStore = create<AppStore>((set, get) => ({
  demands: [
    {
      id: '1',
      title: 'Reparo de iluminação pública',
      description: 'Poste na rua principal está sem luz há 3 dias.',
      status: 'open',
      createdAt: new Date('2026-04-17T10:00:00Z'),
      updatedAt: new Date('2026-04-17T10:00:00Z'),
    },
    {
      id: '2',
      title: 'Buraco na via',
      description: 'Buraco grande na avenida central causando transtornos.',
      status: 'in_progress',
      createdAt: new Date('2026-04-18T12:00:00Z'),
      updatedAt: new Date('2026-04-19T08:00:00Z'),
    },
    {
      id: '3',
      title: 'Coleta de lixo irregular',
      description: 'Caminhão de lixo não passou na última semana.',
      status: 'closed',
      createdAt: new Date('2026-04-15T09:00:00Z'),
      updatedAt: new Date('2026-04-16T14:00:00Z'),
    },
    {
      id: '4',
      title: 'Vazamento de água',
      description: 'Vazamento em frente ao número 123 da rua das Flores.',
      status: 'open',
      createdAt: new Date('2026-04-19T07:00:00Z'),
      updatedAt: new Date('2026-04-19T07:00:00Z'),
    },
  ],

  perfilAtivo: 'cidadao',

  setPerfilAtivo: (perfil) => {
    set(() => ({ perfilAtivo: perfil }));
  },

  addRecord: (demand) => {
    set((state) => {
      const newDemand: Demand = {
        id: (state.demands.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...demand,
      };
      return { demands: [...state.demands, newDemand] };
    });
  },

  updateRecord: (id, updatedData) => {
    set((state) => {
      const updatedDemands = state.demands.map((demand) =>
        demand.id === id
          ? { ...demand, ...updatedData, updatedAt: new Date() }
          : demand
      );
      return { demands: updatedDemands };
    });
  },

  deleteRecord: (id) => {
    set((state) => ({
      demands: state.demands.filter((demand) => demand.id !== id),
    }));
  },

  getRecordById: (id) => {
    return get().demands.find((demand) => demand.id === id);
  },
}));
