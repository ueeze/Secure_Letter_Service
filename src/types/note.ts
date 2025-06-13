export interface Note {
    id: string;
    text: string;
    read: boolean;
    expiresAt: Date;
}

export type NoteStatus = 'loading' | 'success' | 'read' | 'notfound' | 'locked' | 'expired';

export interface NoteError {
    message: string;
    code?: string;
} 