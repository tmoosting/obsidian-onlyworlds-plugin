import { Plugin } from 'obsidian';
import { Category } from './enums'; // Adjust path as needed

export default class ExamplePlugin extends Plugin {
    onload(): void {
        console.log("OW Plugin loaded");

        // Register a new command that will be available in the command palette
        this.addCommand({
            id: 'create-category-folders',
            name: 'Create Element Folders',
            callback: () => {
                this.createCategoryFolders();
            }
        });
    }

    async createCategoryFolders() {
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
				console.log(`Created folder: ${folderName}`);
			} catch (error) {
				console.error(`Error creating folder: ${folderName}`, error);
			}
		} else {
			console.log(`Folder already exists: ${folderName}`);
		}
	}
}
