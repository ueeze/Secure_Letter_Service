import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Note } from '../types/note';
import { encryptText } from '../utils/crypto';

export const createNote = async (text: string, password: string): Promise<string> => {
    const encryptedText = encryptText(text, password);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후

    const docRef = await addDoc(collection(db, 'notes'), {
        text: encryptedText,
        read: false,
        createdAt: serverTimestamp(),
        expiresAt
    });

    return docRef.id;
};

export const fetchNote = async (id: string): Promise<Note | null> => {
    try {
        const noteRef = doc(db, 'notes', id);
        const noteSnap = await getDoc(noteRef);

        if (!noteSnap.exists()) {
            return null;
        }

        const noteData = noteSnap.data();
        return {
            id: noteSnap.id,
            ...noteData,
            expiresAt: noteData.expiresAt?.toDate()
        } as Note;
    } catch (error) {
        console.error('Error fetching note:', error);
        return null;
    }
};

export const markNoteAsRead = async (id: string): Promise<void> => {
    const noteRef = doc(db, 'notes', id);
    await updateDoc(noteRef, {
        read: true
    });
};

export const deleteNote = async (id: string): Promise<void> => {
    try {
        const noteRef = doc(db, 'notes', id);
        await deleteDoc(noteRef);
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}; 