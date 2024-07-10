import { App, Notice } from 'obsidian';
import { Category } from 'enums';  

export class CreateCategoryFoldersCommand {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async execute() {
        for (const category in Category) {
            if (isNaN(Number(category))) { // Check to only use string keys, not numeric values
                await this.createFolderIfNeeded(category);
            }
        }
    }

    async createFolderIfNeeded(folderName: string) {
        const folderPath = `${folderName}/`; // Adjust path if you have a specific directory structure
        let existingFolder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!existingFolder) {
            try {
                await this.app.vault.createFolder(folderPath);
                new Notice(`Created folder: ${folderName}`);
            } catch (error) {
                console.error(`Error creating folder: ${folderName}`, error);
            }
        } else {
            console.log(`Folder already exists: ${folderName}`);
        }
    }
}
