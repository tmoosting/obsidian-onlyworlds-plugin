import { App, Notice, requestUrl, FileSystemAdapter, normalizePath } from 'obsidian';
import Handlebars from 'handlebars';
import { Category } from '../enums';
import { WorldKeyModal } from 'Scripts/WorldKeyModal'; 

export class RetrieveWorldCommand {
    app: App;
    manifest: any;
    private apiUrl = 'https://www.onlyworlds.com/api/worlddata/';

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        new WorldKeyModal(this.app, async (worldKey: string) => {
            if (worldKey.length === 10) {
                try {
                    const response = await requestUrl({
                        url: this.apiUrl + worldKey,
                        method: 'GET'
                    });
                    if (response.status !== 200) {
                        new Notice('Failed to fetch world data: ' + response.status);
                        return;
                    }
                    const data = JSON.parse(response.text);
                    console.log(data); // Output the fetched world data to console

                    const worldData = data['World'];
                    const worldName = worldData ? worldData.name : null;
                    
                    if (!worldName) {
                        new Notice('No valid world data found.');
                        return;
                    }
                    
                    // Proceed to use worldName safely
                    const worldFolderPath = normalizePath(`OnlyWorlds/Worlds/${worldName}/Elements`);
                    if (!this.app.vault.getAbstractFileByPath(worldFolderPath)) {
                        await this.app.vault.createFolder(worldFolderPath);
                    }

                    for (const category in Category) {
                        if (isNaN(Number(category)) && data[category]) {
                            await this.generateElementNotes(worldFolderPath, category, data[category]);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching world data:', error);
                    new Notice('Error fetching world data: ' + error.message);
                }
            } else {
                new Notice('Invalid world key. Please ensure it is a 10-digit number.');
            }
        }).open();
    }

    async generateElementNotes(worldFolderPath: string, category: string, elements: any[]) {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        const templatePath = normalizePath(`${this.app.vault.configDir}/plugins/obsidian-onlyworlds-plugin/Handlebars/${category}Handlebar.md`);

        try {
            const templateText = await fs.read(templatePath);
            const template = Handlebars.compile(templateText);
            const categoryDirectory = normalizePath(`${worldFolderPath}/${category}`);

            if (!this.app.vault.getAbstractFileByPath(categoryDirectory)) {
                await this.app.vault.createFolder(categoryDirectory);
            }

            elements.forEach(async (element) => {
                const noteContent = template(element);
                const notePath = `${categoryDirectory}/${element.name}.md`;
                await fs.write(notePath, noteContent);
                new Notice(`${category} note created: ${notePath}`);
            });
        } catch (error) {
            console.error(`Error processing ${category} notes:`, error);
            new Notice(`Error processing ${category} notes: ` + error.message);
        }
    }
}
