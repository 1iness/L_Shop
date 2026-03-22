import fs from 'fs/promises';
import path from 'path';

export const readData = async <T>(fileName: string): Promise<T[]> => {
    try {
        const filePath = path.resolve('src/data', fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T[];
    } catch (error) {
        return [];
    }
};

export const writeData = async <T>(fileName: string, data: T[]): Promise<void> => {
    const filePath = path.resolve('src/data', fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};