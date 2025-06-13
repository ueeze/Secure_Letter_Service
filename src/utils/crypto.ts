import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

export const encryptText = (text: string, password: string): string => {
    return AES.encrypt(text, password).toString();
};

export const decryptText = (encryptedText: string, password: string): string | null => {
    try {
        const decryptedBytes = AES.decrypt(encryptedText, password);
        const decryptedText = decryptedBytes.toString(Utf8);
        
        if (!decryptedText) {
            return null;
        }
        
        return decryptedText;
    } catch (error) {
        return null;
    }
}; 