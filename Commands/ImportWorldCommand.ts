import { App, Notice, requestUrl, FileSystemAdapter, normalizePath } from 'obsidian';
import Handlebars from 'handlebars';
import { Category } from '../enums';
import { WorldKeyModal } from 'Scripts/WorldKeyModal'; 
import { CreateTemplatesCommand } from './CreateTemplatesCommand';

export class ImportWorldCommand {
    app: App;
    manifest: any;
    private apiUrl = 'https://www.onlyworlds.com/api/worlddata/';

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        new WorldKeyModal(this.app, async (worldKey: string) => {
            console.log('World key received:', worldKey);
            if (worldKey.length === 10) {
                try {                
                    const response = await requestUrl({
                        url: this.apiUrl + worldKey,
                        method: 'GET'
                    });
                    console.log('Fetch response:', response);
                    if (response.status !== 200) {
                        new Notice('Failed to fetch world data: ' + response.status);
                        return;
                    }
                    const data = JSON.parse(response.text);
                    console.log('World data:', data);
                    const worldData = data['World'];
                    const worldName = worldData ? worldData.name : null;
                    
                    if (!worldName) {
                        new Notice('No valid world data found.');
                        return;
                    }

                    const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);
                    await createTemplatesCommand.execute();
                    
                    const worldFolderPath = normalizePath(`OnlyWorlds/Worlds/${worldName}`);
                    if (!this.app.vault.getAbstractFileByPath(worldFolderPath)) {
                        await this.app.vault.createFolder(worldFolderPath);
                    }

                    await this.generateWorldFile(worldData, worldFolderPath);
                    await this.generateElementNotes(worldFolderPath, data);
                } catch (error) {
                    console.error('Error during world import:', error);
                    new Notice('Error fetching world data: ' + error.message);
                }
            } else {
                new Notice('Invalid world key. Please ensure it is a 10-digit number.');
            }
        }).open();
    }

    async generateWorldFile(worldData: any, worldFolderPath: string) {
        const fs = this.app.vault.adapter as FileSystemAdapter;
        const worldTemplatePath = normalizePath(`${this.app.vault.configDir}/plugins/obsidian-onlyworlds-plugin/Handlebars/WorldHandlebar.md`);
        const worldTemplateText = await fs.read(worldTemplatePath);
        const worldTemplate = Handlebars.compile(worldTemplateText);
        const worldContent = worldTemplate(worldData);
        const worldFilePath = `${worldFolderPath}/World.md`;
        await fs.write(worldFilePath, worldContent);
        console.log(`World file created at: ${worldFilePath}`);
        new Notice(`World file created: ${worldFilePath}`);
    }

    async generateElementNotes(worldFolderPath: string, data: any) {
        const fs = this.app.vault.adapter as FileSystemAdapter;
        console.log('Starting to generate element notes...');
    
        for (const category in Category) {
            if (!isNaN(Number(category)) || !data[category]) continue;
            
            const elements = data[category];
            const categoryDirectory = normalizePath(`${worldFolderPath}/${category}`);
            if (!this.app.vault.getAbstractFileByPath(categoryDirectory)) {
                await this.app.vault.createFolder(categoryDirectory);
            }
    
            const templatePath = normalizePath(`${this.app.vault.configDir}/plugins/obsidian-onlyworlds-plugin/Handlebars/${category}Handlebar.md`);
            const templateText = await fs.read(templatePath);
            const template = Handlebars.compile(templateText);
    
            for (const element of elements) {
                let noteContent = template(element);
                console.log(`Original content for ${element.name}: ${noteContent}`);
    
                noteContent = await this.linkifyContent(noteContent, data); // Linkify the content
                console.log(`Linkified content for ${element.name}: ${noteContent}`);
    
                const notePath = `${categoryDirectory}/${element.name}.md`;
                await fs.write(notePath, noteContent);
                console.log(`Note created for: ${element.name} at ${notePath}`);
            }
        }
        new Notice(`Notes created for all categories.`);
    }
    
    async linkifyContent(noteContent: string, data: any): Promise<string> {
        console.log('Linkifying content...');
        console.log(`Content before linkify: ${noteContent}`);
    
        // Adjusted to match [[ID]] format as well
        noteContent = noteContent.replace(/\[\[(.*?)\]\]/g, (match, id) => {
            const name = this.findNameById(id, data);
            console.log(`Attempting to replace ID: ${id} with name: ${name}`);
            return name ? `[[${name}]]` : `[[Unknown]]`; // Maintain markdown link format
        });
    
        console.log(`Content after linkify: ${noteContent}`);
        return noteContent;
    }
    
    
    findNameById(id: string, data: any): string | undefined {
        console.log(`Searching for ID: ${id}`);
        for (const category in Category) {
            if (Array.isArray(data[category])) {
                const found = data[category].find((item: any) => item.id === id);
                if (found) {
                    console.log(`Found name: ${found.name} for ID: ${id}`);
                    return found.name;
                }
            }
        }
        console.log(`No name found for ID: ${id}`);
        return undefined; // Return undefined if no match is found
    }
}
