import { App, Notice, TFile, normalizePath } from 'obsidian';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { Category } from '../enums'; // Adjust path as needed

export class CreateTemplatesCommand {
    app: App;
    manifest: any;

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute(): Promise<void> {
        const templateFolder = normalizePath('Templates/OnlyWorlds');
        const categories = Object.keys(Category).filter(key => isNaN(Number(key)));

        // Ensure the Templates/OnlyWorlds folder exists
        await this.createFolderIfNeeded(templateFolder);

        // Create each template file in the user's vault
        for (const category of categories) {
            const fileName = `${category}.md`;
            const sourcePath = resolve((this.app.vault.adapter as any).basePath, '.obsidian', 'plugins', 'obsidian-onlyworlds-plugin', 'Templates', fileName);
            const targetPath = normalizePath(`${templateFolder}/${fileName}`);

            console.log(`Processing template for category: ${category}`);
            console.log(`Source path: ${sourcePath}`);
            console.log(`Target path: ${targetPath}`);

            // Read content from the source file and write it to the target file
            if (existsSync(sourcePath)) {
                console.log(`Template file found: ${sourcePath}`);
                const content = readFileSync(sourcePath, 'utf-8');
                await this.app.vault.create(targetPath, content);
                new Notice(`Created template: ${targetPath}`);
                console.log(`Created template: ${targetPath}`);
            } else {
                console.error(`Template file not found: ${sourcePath}`);
            }
        }
    }

    async createFolderIfNeeded(folderPath: string) {
        const normalizedPath = normalizePath(folderPath);
        console.log(`Checking if folder exists: ${normalizedPath}`);
        
        let existingFolder = this.app.vault.getAbstractFileByPath(normalizedPath);
        if (!existingFolder) {
            try {
                console.log(`Folder not found, creating: ${normalizedPath}`);
                await this.app.vault.createFolder(normalizedPath);
                new Notice(`Created folder: ${normalizedPath}`);
                console.log(`Created folder: ${normalizedPath}`);
            } catch (error) {
                console.error(`Error creating folder: ${normalizedPath}`, error);
            }
        } else {
            console.log(`Folder already exists: ${normalizedPath}`);
        }
    }
}
