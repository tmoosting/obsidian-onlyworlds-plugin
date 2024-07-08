import { Plugin } from 'obsidian';
import { Category } from './enums'; // Adjust path as needed

export default class ExamplePlugin extends Plugin {
	onload(): void {
        console.log("OW Plugin loaded");

        // Register a command to create category folders
        this.addCommand({
            id: 'create-category-folders',
            name: 'Create Element Folders',
            callback: () => {
                this.createCategoryFolders();
            }
        });

        // Register a command to setup templates
        this.addCommand({
            id: 'setup-templates',
            name: 'Setup Character Templates',
            callback: () => this.setupTemplates(),
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
	async setupTemplates() {
        const templatesPath = "/Templates/";
        for (const category in Category) {
            if (isNaN(Number(category))) { // Check to only use string keys, not numeric values
                const templateFileName = category + ".md";
                const templateExists = await this.app.vault.adapter.exists(templatesPath + templateFileName);

                if (!templateExists) {
                    try {
                        const internalTemplatePath = this.manifest.dir + `/Templates/${templateFileName}`;
                        const templateContent = await this.app.vault.adapter.read(internalTemplatePath);
                        await this.app.vault.create(templatesPath + templateFileName, templateContent);
                        console.log(`Template created: ${templateFileName}`);
                    } catch (error) {
                        console.error(`Error setting up template ${templateFileName}: `, error);
                    }
                } else {
                    console.log(`Template already exists: ${templateFileName}`);
                }
            }
        }
    }
}
