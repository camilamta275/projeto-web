import cron from 'node-cron';
import { runMetricsConsolidation } from '../services/metricsConsolidationService';

export function registerCronJobs(): void {
  const schedule = process.env.CRON_METRICS_SCHEDULE || '0 * * * *';

  if (!cron.validate(schedule)) {
    console.error(`[Cron] Invalid CRON_METRICS_SCHEDULE: "${schedule}" — cron jobs not registered`);
    return;
  }

  cron.schedule(schedule, async () => {
    await runMetricsConsolidation();
  });

  console.log(`[Cron] Metrics consolidation scheduled: ${schedule}`);
}
