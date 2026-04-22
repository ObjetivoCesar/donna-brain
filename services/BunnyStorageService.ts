
/**
 * Servicio para integraciÃ³n con BunnyNet Storage API
 * DocumentaciÃ³n: https://docs.bunny.net/reference/storage-api
 */

const API_KEY = import.meta.env.VITE_BUNNY_API_KEY;
const STORAGE_ZONE_NAME = import.meta.env.VITE_BUNNY_STORAGE_NAME;
const PULL_ZONE_URL = import.meta.env.VITE_BUNNY_PULL_ZONE;
const REGION = import.meta.env.VITE_BUNNY_REGION || 'de'; // 'de' (Falkenstein) is default. Use 'ny' for New York, etc.

const BASE_URL = (() => {
    switch (REGION) {
        case 'ny': return 'https://ny.storage.bunnycdn.com';
        case 'la': return 'https://la.storage.bunnycdn.com';
        case 'sg': return 'https://sg.storage.bunnycdn.com';
        case 'sy': return 'https://syd.storage.bunnycdn.com';
        default: return 'https://storage.bunnycdn.com'; // Germany (default)
    }
})();

class BunnyStorageService {

    isConfigured(): boolean {
        return !!(API_KEY && STORAGE_ZONE_NAME && PULL_ZONE_URL);
    }

    /**
     * Sube un archivo a BunnyNet
     * @param file Archivo a subir
     * @param path (Opcional) Carpeta dentro del bucket (ej: 'progress-photos')
     * @returns URL pÃºblica de la imagen
     */
    async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
        if (!this.isConfigured()) {
            throw new Error('BunnyNet no estÃ¡ configurado. Faltan variables de entorno.');
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${folder}/${fileName}`;
        const urlOptions = {
            method: 'PUT',
            headers: {
                'AccessKey': API_KEY,
                'Content-Type': 'application/octet-stream', // BunnyNet expects raw binary
            },
            body: file
        };

        // Construct Storage API URL: https://{region}.storage.bunnycdn.com/{storageZoneName}/{path}/{fileName}
        const uploadUrl = `${BASE_URL}/${STORAGE_ZONE_NAME}/${filePath}`;

        console.log(`📤 Subiendo a BunnyNet: ${filePath}...`);

        try {
            const response = await fetch(uploadUrl, urlOptions);
            const responseData = await response.json();

            if (!response.ok) {
                console.error('❌ Error BunnyNet Upload:', responseData);
                throw new Error(`Error subiendo archivo: ${responseData.Message || response.statusText}`);
            }

            console.log('✅ Subida exitosa:', responseData);

            // Construct Public Pull Zone URL
            // https://{pullZoneUrl}/{path}/{fileName}
            // Aseguramos que la PULL_ZONE_URL no tenga slash final y el path empiece con slash si es necesario
            const publicUrl = `${PULL_ZONE_URL.replace(/\/$/, '')}/${filePath}`;
            return publicUrl;

        } catch (error) {
            console.error('❌ ExcepciÃ³n en subida BunnyNet:', error);
            throw error;
        }
    }

    /**
     * Lista archivos (Opcional, para debug)
     */
    async listFiles(path: string = ''): Promise<any[]> {
        if (!this.isConfigured()) return [];

        const url = `${BASE_URL}/${STORAGE_ZONE_NAME}/${path}/`;
        const options = {
            method: 'GET',
            headers: {
                'AccessKey': API_KEY,
                'Accept': 'application/json'
            }
        };

        const response = await fetch(url, options);
        return await response.json();
    }
}

export default new BunnyStorageService();
