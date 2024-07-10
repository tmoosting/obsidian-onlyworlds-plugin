import { App, Notice } from 'obsidian';
import { Category } from '../enums'; // Adjust path as needed
import * as fs from 'fs';
import * as path from 'path';

export class CreateTemplatesCommand {
    app: App;
    manifest: any;

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        const templatesPath = "Templates";
        await this.createFolderIfNeeded(templatesPath);

        const onlyWorldsPath = `${templatesPath}/OnlyWorlds`;
        await this.createFolderIfNeeded(onlyWorldsPath);

        for (const category in Category) {
            if (isNaN(Number(category))) { // Check to only use string keys, not numeric values
                const templateFileName = `${category}.md`;
                const internalTemplatePath = path.join(this.manifest.dir, 'Templates', templateFileName);
                const destinationPath = `${onlyWorldsPath}/${templateFileName}`;

                try {
                    const templateContent = await this.readFile(internalTemplatePath);
                    if (templateContent) {
                        await this.app.vault.create(destinationPath, templateContent);
                        new Notice(`Template created: ${templateFileName}`);
                    } else {
                        console.error(`Template content for ${templateFileName} is empty or could not be read.`);
                    }
                } catch (error) {
                    console.error(`Error setting up template ${templateFileName}: `, error);
                }
            }
        }
    }

    async createFolderIfNeeded(folderPath: string) {
        let existingFolder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!existingFolder) {
            try {
                await this.app.vault.createFolder(folderPath);
                new Notice(`Created folder: ${folderPath}`);
            } catch (error) {
                console.error(`Error creating folder: ${folderPath}`, error);
            }
        } else {
            console.log(`Folder already exists: ${folderPath}`);
        }
    }

    async readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file at ${filePath}: `, err);
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}
