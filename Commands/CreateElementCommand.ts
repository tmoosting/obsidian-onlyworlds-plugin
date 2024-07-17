import { App, TFile, Notice, normalizePath, WorkspaceLeaf, TFolder } from 'obsidian';
import { v7 as uuidv7 } from 'uuid';

export class CreateElementCommand {
    app: App;
    manifest: any;

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute(category: string): Promise<void> {
        const uuid = uuidv7();
        const templateContent = await this.getTemplateContent(category);
        if (!templateContent) {
            new Notice(`Template for ${category} not found.`);
            return;
        }

        const newContent = this.insertIdInTemplate(templateContent, uuid);
        await this.createNoteInCorrectFolder(newContent, category, uuid);
    }

    async getTemplateContent(category: string): Promise<string | null> {
        const templatePath = normalizePath(`OnlyWorlds/Templates/${category}.md`);
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (templateFile instanceof TFile) {
            return this.app.vault.read(templateFile);
        }
        return null;
    }

    insertIdInTemplate(content: string, id: string): string {
        return content.replace("{{id}}", id);  
    }

    async createNoteInCorrectFolder(content: string, category: string, id: string): Promise<void> {
        const topWorld = await this.determineTopWorldFolder();
        const worldFolder = normalizePath(`OnlyWorlds/Worlds/${topWorld}/Elements/${category}`);
        await this.createFolderIfNeeded(worldFolder);
    
        const newNotePath = normalizePath(`${worldFolder}/New ${category}.md`);
        try {
            const createdFile = await this.app.vault.create(newNotePath, content);
            new Notice(`New ${category} element created successfully with ID: ${id}`);
            this.openNoteInNewPane(createdFile);
        } catch (error) {
            console.error(`Failed to create note: ${newNotePath}`, error);
            new Notice(`Failed to create note: ${newNotePath}`);
        }
    }

    async openNoteInNewPane(file: TFile) {
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);
    }

    async determineTopWorldFolder(): Promise<string> {
        const worldsPath = normalizePath('OnlyWorlds/Worlds');
        const worldsFolder = this.app.vault.getAbstractFileByPath(worldsPath);
        if (worldsFolder instanceof TFolder) {
            const subFolders = worldsFolder.children.filter(child => child instanceof TFolder);
            return subFolders.length > 0 ? subFolders[0].name : 'DefaultWorld'; // or some logic to choose the correct folder
        }
        return 'DefaultWorld'; // default folder name if no other folders found
    }

    async createFolderIfNeeded(folderPath: string): Promise<void> {
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
