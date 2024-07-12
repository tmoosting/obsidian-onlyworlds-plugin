import { App, Notice, normalizePath } from 'obsidian';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Category } from '../enums';
import { v7 as uuidv7 } from 'uuid';

export class CreateTemplatesCommand {
    app: App;
    manifest: any;

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute(): Promise<void> {
        const templateFolder = normalizePath('OnlyWorlds/Templates');
        const categories = Object.keys(Category).filter(key => isNaN(Number(key)));

        await this.createFolderIfNeeded(templateFolder);

        for (const category of categories) {
            const fileName = `${category}.md`;
            const sourcePath = resolve((this.app.vault.adapter as any).basePath, '.obsidian', 'plugins', 'obsidian-onlyworlds-plugin', 'Templates', fileName);
            const targetPath = normalizePath(`${templateFolder}/${fileName}`);

            if (existsSync(sourcePath)) {
                let content = readFileSync(sourcePath, 'utf-8');
                // Generate UUID and insert it into the template content
                const uuid = uuidv7();
                content = content.replace("{{id}}", uuid); // Assume {{id}} is where the UUID should go
                
                await this.app.vault.create(targetPath, content);
                new Notice(`Created template with ID: ${uuid}`);
            } else {
                console.error(`Template file not found: ${sourcePath}`);
            }
        }//
    }

    async createFolderIfNeeded(folderPath: string) {
        const normalizedPath = normalizePath(folderPath);
        let existingFolder = this.app.vault.getAbstractFileByPath(normalizedPath);
        if (!existingFolder) {
            try {
                await this.app.vault.createFolder(normalizedPath);
                new Notice(`Created folder: ${normalizedPath}`);
            } catch (error) {
                console.error(`Error creating folder: ${normalizedPath}`, error);
            }
        }
    }
}
