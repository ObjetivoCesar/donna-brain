export class AudioService {
    private audio: HTMLAudioElement | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
        }
    }

    play(filename: string) {
        if (!this.audio) return;

        this.audio.src = `/audios/${filename}`;
        this.audio.play().catch(error => {
            console.error("Error playing audio:", error);
        });
    }

    stop() {
        if (!this.audio) return;

        this.audio.pause();
        this.audio.currentTime = 0;
    }
}
