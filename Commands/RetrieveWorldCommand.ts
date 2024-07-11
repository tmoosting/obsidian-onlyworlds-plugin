import { App, Notice, requestUrl, FileSystemAdapter, normalizePath  } from 'obsidian';
import { WorldKeyModal } from 'Scripts/WorldKeyModal'; // Adjust path if necessary
import Handlebars from 'handlebars';
import { resolve } from 'path';

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
                    console.log(data);  // Output the fetched world data to console
                    if (data.Character) {
                        await this.generateCharacterNotes(data.Character);
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

    async generateCharacterNotes(characters: any[]) {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        // Directly construct the path to the Handlebars template within the plugin folder
        const templatePath = normalizePath(this.app.vault.configDir + '/plugins/obsidian-onlyworlds-plugin/Handlebars/CharacterHandlebar.md');
        console.log(`Template Path: ${templatePath}`); // Debug to verify the correct path
    
        try {
            const templateText = await fs.read(templatePath);
            const template = Handlebars.compile(templateText);
    
            // Ensure the directory for character notes exists
            const charactersDirectory = 'Characters';
            if (!this.app.vault.getAbstractFileByPath(charactersDirectory)) {
                await this.app.vault.createFolder(charactersDirectory);
            }
    
            characters.forEach(async (character) => {
                const noteContent = template(character);
                const notePath = `${charactersDirectory}/Character_${character.id}.md`;
                await fs.write(notePath, noteContent);
                new Notice(`Character note created: ${notePath}`);
            });
        } catch (error) {
            console.error('Error processing character notes:', error);
            new Notice('Error processing character notes: ' + error.message);
        }
    }
    
}
