import React, { useState, useEffect } from 'react';
import PhotoStorageService from '../services/PhotoStorageService';

interface PhotoDisplayProps {
    photoId: string;
    alt: string;
    className?: string;
}

/**
 * Component to display photos stored in IndexedDB
 * Automatically fetches and displays the photo blob URL
 */
const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ photoId, alt, className }) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPhoto = async () => {
            try {
                setLoading(true);
                setError(false);
                const url = await PhotoStorageService.getPhotoUrl(photoId);

                if (isMounted) {
                    if (url) {
                        setPhotoUrl(url);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading photo:', err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadPhoto();

        // Cleanup: revoke blob URL when component unmounts
        return () => {
            isMounted = false;
            if (photoUrl) {
                URL.revokeObjectURL(photoUrl);
            }
        };
    }, [photoId]);

    if (loading) {
        return (
            <div className={`${className} bg-gray-700 animate-pulse flex items-center justify-center`}>
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    if (error || !photoUrl) {
        return (
            <div className={`${className} bg-gray-700 flex items-center justify-center`}>
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        );
    }

    return <img src={photoUrl} alt={alt} className={className} />;
};

export default PhotoDisplay;
