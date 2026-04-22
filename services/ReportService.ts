import { DailyReport, ScheduledActivity, ActivityDeviation } from '../types';
import DeviationService from './DeviationService';
import { supabase } from './supabase';
import SyncQueueService from './SyncQueue';

class ReportService {
    /**
     * Genera un informe diario en formato Markdown
     */
    generateDailyReport(
        date: string,
        schedule: ScheduledActivity[],
        deviations: ActivityDeviation[]
    ): string {
        const reportDate = new Date(date);
        const dateFormatted = reportDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calcular adherencia
        const totalActivities = schedule.length;
        const deviationsCount = deviations.length;
        const adherencePercentage = totalActivities > 0
            ? Math.round(((totalActivities - deviationsCount) / totalActivities) * 100)
            : 100;

        // Construir el informe
        let markdown = `# 📊 Informe Diario - ${dateFormatted}\n\n`;
        markdown += `**Generado:** ${new Date().toLocaleString('es-ES')}\n\n`;
        markdown += `---\n\n`;

        // Resumen ejecutivo
        markdown += `## 📈 Resumen Ejecutivo\n\n`;
        markdown += `- **Actividades programadas:** ${totalActivities}\n`;
        markdown += `- **Desviaciones registradas:** ${deviationsCount}\n`;
        markdown += `- **Adherencia al plan:** ${adherencePercentage}%\n\n`;

        if (adherencePercentage >= 80) {
            markdown += `✅ **Excelente adherencia al plan**\n\n`;
        } else if (adherencePercentage >= 60) {
            markdown += `⚠️ **Adherencia moderada - revisar desviaciones**\n\n`;
        } else {
            markdown += `❌ **Baja adherencia - requiere atención**\n\n`;
        }

        markdown += `---\n\n`;

        // Horario programado
        markdown += `## 📅 Horario Programado\n\n`;
        markdown += `| Horario | Actividad | Enfoque |\n`;
        markdown += `|---------|-----------|----------|\n`;
        schedule.forEach(activity => {
            markdown += `| ${activity.time} | ${activity.activity} | ${activity.focus} |\n`;
        });
        markdown += `\n`;

        // Desviaciones
        if (deviations.length > 0) {
            markdown += `## 🔄 Desviaciones Registradas\n\n`;
            deviations.forEach((deviation, index) => {
                const time = new Date(deviation.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                markdown += `### ${index + 1}. Cambio a las ${time}\n\n`;
                markdown += `- **Programado:** ${deviation.scheduledActivity} (${deviation.scheduledTime})\n`;
                markdown += `- **Realizado:** ${deviation.actualActivity}\n`;
                markdown += `- **Razón:** ${deviation.reason}\n\n`;
            });
        } else {
            markdown += `## ✅ Sin Desviaciones\n\n`;
            markdown += `No se registraron cambios en el plan del día. ¡Excelente adherencia!\n\n`;
        }

        // Notas finales
        markdown += `---\n\n`;
        markdown += `## 💡 Notas\n\n`;
        markdown += `Este informe fue generado automáticamente por Daily Flow Assistant.\n`;
        markdown += `Los datos se almacenan localmente en tu navegador.\n`;

        return markdown;
    }

    /**
     * Genera y descarga el informe como archivo .md
     */
    /**
     * Genera y descarga el informe como archivo .md
     */
    async downloadDailyReport(date: string, schedule: ScheduledActivity[]): Promise<void> {
        const deviations = await DeviationService.getDeviationsForDate(date);
        const markdown = this.generateDailyReport(date, schedule, deviations);

        // Crear blob y descargar
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe-diario-${date}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`📥 Informe descargado: informe-diario-${date}.md`);

        // Save to Supabase
        const adherence = this.calculateAdherence(schedule.length, deviations.length);
        await this.saveReportToSupabase(date, markdown, adherence);
    }

    private calculateAdherence(totalActivities: number, deviationsCount: number): number {
        return totalActivities > 0
            ? Math.round(((totalActivities - deviationsCount) / totalActivities) * 100)
            : 100;
    }

    async saveReportToSupabase(date: string, markdown: string, adherence: number): Promise<void> {
        // We use UPSERT for simplicity with specific ID (date-based as primary key in logic) 
        // Or if we have a UUID, we find it. But for reports, one per date is the rule.

        SyncQueueService.getInstance().enqueue('daily_reports', 'UPSERT', {
            date: date,
            report_content: markdown,
            adherence_score: adherence,
            created_at: new Date().toISOString()
        });

        console.log('✅ Report enqueued for Supabase history');
    }

    /**
     * Copia el informe al portapapeles
     */
    async copyReportToClipboard(date: string, schedule: ScheduledActivity[]): Promise<void> {
        const deviations = await DeviationService.getDeviationsForDate(date);
        const markdown = this.generateDailyReport(date, schedule, deviations);

        try {
            await navigator.clipboard.writeText(markdown);
            console.log('📋 Informe copiado al portapapeles');
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            throw error;
        }
    }

    /**
     * Genera un objeto DailyReport para almacenamiento
     */
    createDailyReportObject(
        date: string,
        schedule: ScheduledActivity[],
        deviations: ActivityDeviation[]
    ): DailyReport {
        const totalActivities = schedule.length;
        const deviationsCount = deviations.length;
        const adherencePercentage = totalActivities > 0
            ? Math.round(((totalActivities - deviationsCount) / totalActivities) * 100)
            : 100;

        return {
            date,
            generatedAt: new Date().toISOString(),
            schedule,
            deviations,
            adherencePercentage
        };
    }
}

export default new ReportService();
