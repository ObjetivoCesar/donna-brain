/**
 * DataExportService
 * 
 * Centralized service for exporting and importing all app data.
 * Generates structured JSON backups with metadata and validation.
 */

import MeasurementService from './MeasurementService';
import WorkoutService from './WorkoutService';
import { nutritionService } from './NutritionService';
import DeviationService from './DeviationService';
import { ScheduleService } from './ScheduleService';
import { BodyMeasurements } from '../types';

export interface ExportData {
    version: string;
    exportedAt: string;
    data: {
        measurements: BodyMeasurements[];
        workouts: any[];
        nutrition: any;
        deviations: any[];
        schedule: any;
    };
}

class DataExportService {
    private readonly VERSION = '1.0.0';

    /**
     * Export all app data to JSON
     */
    async exportAllData(): Promise<ExportData> {
        console.log('📦 Exporting all app data...');

        const exportData: ExportData = {
            version: this.VERSION,
            exportedAt: new Date().toISOString(),
            data: {
                measurements: await this.exportMeasurements(),
                workouts: this.exportWorkouts(),
                nutrition: this.exportNutrition(),
                deviations: this.exportDeviations(),
                schedule: this.exportSchedule(),
            },
        };

        console.log('✅ Export complete');
        return exportData;
    }

    /**
     * Export measurements (without photo blobs, only metadata)
     */
    private async exportMeasurements(): Promise<BodyMeasurements[]> {
        const measurements = await MeasurementService.getHistory();

        // Photos are already IDs (not Base64), so they're safe to export
        // Note: The actual photo blobs stay in IndexedDB and won't be in the backup
        return measurements;
    }

    /**
     * Export workout data
     */
    private exportWorkouts(): any[] {
        try {
            const workoutHistory = WorkoutService.getHistory();
            return workoutHistory;
        } catch (error) {
            console.error('Error exporting workouts:', error);
            return [];
        }
    }

    /**
     * Export nutrition data
     */
    private exportNutrition(): any {
        try {
            const nutritionData = nutritionService.exportData();
            return nutritionData;
        } catch (error) {
            console.error('Error exporting nutrition:', error);
            return {};
        }
    }

    /**
     * Export deviations
     */
    private exportDeviations(): any[] {
        try {
            const deviations = DeviationService.getAllDeviations();
            return deviations;
        } catch (error) {
            console.error('Error exporting deviations:', error);
            return [];
        }
    }

    /**
     * Export schedule
     */
    private exportSchedule(): any {
        try {
            // For schedule, we'll export the raw localStorage data
            const scheduleData = localStorage.getItem('daily_flow_data_v1');
            return scheduleData ? JSON.parse(scheduleData) : {};
        } catch (error) {
            console.error('Error exporting schedule:', error);
            return {};
        }
    }

    /**
     * Download export data as JSON file
     */
    async downloadBackup(): Promise<void> {
        const data = await this.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const today = new Date().toISOString().split('T')[0];
        const filename = `daily-flow-backup-${today}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
        console.log(`✅ Backup downloaded: ${filename}`);
    }

    /**
     * Validate import data structure
     */
    private validateImportData(data: any): boolean {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        if (!data.version || !data.exportedAt || !data.data) {
            throw new Error('Missing required fields (version, exportedAt, data)');
        }

        // Check version compatibility
        const [majorVersion] = data.version.split('.');
        const [currentMajor] = this.VERSION.split('.');

        if (majorVersion !== currentMajor) {
            throw new Error(`Incompatible version: ${data.version} (current: ${this.VERSION})`);
        }

        return true;
    }

    /**
     * Import data from JSON
     */
    async importData(jsonData: ExportData): Promise<void> {
        console.log('📥 Importing data...');

        // Validate data
        this.validateImportData(jsonData);

        try {
            // Import measurements
            if (jsonData.data.measurements && Array.isArray(jsonData.data.measurements)) {
                localStorage.setItem('daily-flow-measurements', JSON.stringify(jsonData.data.measurements));
                console.log(`✅ Imported ${jsonData.data.measurements.length} measurements`);
            }

            // Import workouts
            if (jsonData.data.workouts) {
                WorkoutService.importHistory(jsonData.data.workouts);
                console.log('✅ Imported workout history');
            }

            // Import nutrition
            if (jsonData.data.nutrition) {
                nutritionService.importData(jsonData.data.nutrition);
                console.log('✅ Imported nutrition data');
            }

            // Import deviations
            if (jsonData.data.deviations && Array.isArray(jsonData.data.deviations)) {
                localStorage.setItem('daily-flow-deviations', JSON.stringify(jsonData.data.deviations));
                console.log(`✅ Imported ${jsonData.data.deviations.length} deviations`);
            }

            // Import schedule
            if (jsonData.data.schedule) {
                localStorage.setItem('daily-flow-schedule', JSON.stringify(jsonData.data.schedule));
                console.log('✅ Imported schedule');
            }

            console.log('✅ Import complete');
        } catch (error) {
            console.error('❌ Error during import:', error);
            throw error;
        }
    }

    /**
     * Import from file upload
     */
    async importFromFile(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    await this.importData(data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    }
}

export default new DataExportService();
