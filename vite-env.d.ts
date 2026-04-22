/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BUNNY_API_KEY: string
    readonly VITE_BUNNY_STORAGE_NAME: string
    readonly VITE_BUNNY_REGION: string
    readonly VITE_BUNNY_PULL_ZONE: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
