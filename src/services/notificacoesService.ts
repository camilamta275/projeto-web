import { Notificacao } from '@/types/notificacao';

export const fetchNotificacoesService = async (usuarioId: string): Promise<Notificacao[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulando o mock de notificações associadas a chamados abertos
      resolve([
        {
          id: '1',
          titulo: 'Chamado #1234 em Atendimento',
          mensagem: 'A equipe técnica começou a trabalhar no seu chamado sobre fiação elétrica.',
          tipo: 'status-atualizado',
          lida: false,
          chamadoId: '1234',
          criadoEm: new Date().toISOString(),
        },
        {
          id: '2',
          titulo: 'Chamado #1052 Concluído',
          mensagem: 'O serviço de podas foi finalizado com sucesso.',
          tipo: 'chamado-concluido',
          lida: true,
          chamadoId: '1052',
          criadoEm: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    }, 1200);
  });
};