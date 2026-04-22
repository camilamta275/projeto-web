export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'chamado' | 'status' | 'equipe' | 'concluido' | 'chamado-registrado' | 'status-atualizado' | 'equipe-designada' | 'chamado-concluido';
  lida: boolean;
  chamadoId?: string;
  criadoEm: string | Date;
}