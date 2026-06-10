import { createApp } from './app';
import { registerCronJobs } from './config/cron';
import 'dotenv/config';

const app = createApp();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  registerCronJobs();
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nERRO: a porta ${PORT} já está em uso.`);
    console.error('Encerre o processo anterior e tente novamente.');
    console.error('PowerShell: Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n');
    process.exit(1);
  }
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
