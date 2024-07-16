import { App, Notice, requestUrl, FileSystemAdapter, normalizePath, TFile } from 'obsidian';
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
                    // Get the world data
                    const data = JSON.parse(response.text);
                    console.log(data); // Output the fetched world data to console
    
                    const worldData = data['World'];
                    const worldName = worldData ? worldData.name : null;
                    
                    if (!worldName) {
                        new Notice('No valid world data found.');
                        return;
                    }

                    // Create template notes from plugin files
                    const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest );
                    await createTemplatesCommand.execute();
                    
                    const worldFolderPath = normalizePath(`OnlyWorlds/Worlds/${worldName}`);
                    if (!this.app.vault.getAbstractFileByPath(worldFolderPath)) {
                        await this.app.vault.createFolder(worldFolderPath);
                    }
    
                    // Generate World data file
                    await this.generateWorldFile(worldData, worldFolderPath);
    
                    // Generate elements notes
                    const elementsFolderPath = normalizePath(`${worldFolderPath}/Elements`);
                    if (!this.app.vault.getAbstractFileByPath(elementsFolderPath)) {
                        await this.app.vault.createFolder(elementsFolderPath);
                    }    
                    for (const category in Category) {
                        if (isNaN(Number(category)) && data[category]) {
                            await this.generateElementNotes(elementsFolderPath, category, data[category], data);
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

    // this function works, pls leave alone
    async generateWorldFile(worldData: any, worldFolderPath: string) {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        const worldTemplatePath = normalizePath(`${this.app.vault.configDir}/plugins/obsidian-onlyworlds-plugin/Handlebars/WorldHandlebar.md`);
    
        try {
            const worldTemplateText = await fs.read(worldTemplatePath);
            const worldTemplate = Handlebars.compile(worldTemplateText);
    
            const worldContent = worldTemplate(worldData);
            const worldFilePath = `${worldFolderPath}/World.md`;
    
            await fs.write(worldFilePath, worldContent);
            new Notice(`World file created: ${worldFilePath}`);
        } catch (error) {
            console.error('Error creating world file:', error);
            new Notice('Error creating world file: ' + error.message);
        }
    }
    private extractWorldName(worldFolderPath: string): string {
        const pathParts = worldFolderPath.split('/');
        const worldIndex = pathParts.indexOf('Worlds');
        return pathParts[worldIndex + 1];
    }


    // here we: read the json data; use handlebars to create data objects
    async generateElementNotes(worldFolderPath: string, category: string, elements: any[], worldData: any): Promise<void> {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        const templatePath = normalizePath(`${this.app.vault.configDir}/plugins/obsidian-onlyworlds-plugin/Handlebars/${category}Handlebar.md`);
        const worldName = this.extractWorldName(worldFolderPath);
        const idToNameMap = await this.getIdToNameMapFromWorldData(worldData);
    
        try {
            const templateText = await fs.read(templatePath);
            const template = Handlebars.compile(templateText);
            const categoryDirectory = normalizePath(`${worldFolderPath}/${category}`);
    
            if (!this.app.vault.getAbstractFileByPath(categoryDirectory)) {
                await this.app.vault.createFolder(categoryDirectory);
            }
    
            for (const element of elements) {
                const updatedElement = this.replaceIdsWithLinks(element, idToNameMap);
                const noteContent = template(updatedElement);
                const notePath = `${categoryDirectory}/${updatedElement.name}.md`;
                await fs.write(notePath, noteContent);
                new Notice(`${category} note created: ${notePath}`);
            }
        } catch (error) {
            console.error(`Error processing ${category} notes:`, error);
            new Notice(`Error processing ${category} notes: ` + error.message);
        }
    }
    async getIdToNameMapFromWorldData(worldData: any): Promise<{[id: string]: string}> {
        const idToNameMap: {[id: string]: string} = {};
    
        // Log the incoming worldData for debugging
        console.log("Received worldData:", worldData);
    
        // Checking if worldData actually contains data under the 'Character' category
        if (worldData && worldData.Character) {
            console.log("Processing Characters:", worldData.Character);
            worldData.Character.forEach((character: { id: string; name: string }) => {
                if (character.id && character.name) {
                    idToNameMap[character.id] = character.name;
                    console.log(`Mapped ${character.id} to ${character.name}`);
                }
            });
        } else {
            console.log("No 'Character' category found or it is empty", worldData);
        }
    
        // Check and log if any other categories exist and process them
        // Example for 'Object' category, add similar blocks for other categories if needed
        if (worldData && worldData.Object) {
            console.log("Processing Objects:", worldData.Object);
            worldData.Object.forEach((object: { id: string; name: string }) => {
                if (object.id && object.name) {
                    idToNameMap[object.id] = object.name;
                    console.log(`Mapped ${object.id} to ${object.name}`);
                }
            });
        }
    
        return idToNameMap;
    }
    
    
     

   
    replaceIdsWithLinks(element: Element, idToNameMap: IdToNameMap): Element {
        console.log(`Replacing IDs in element with name: ${element.name}`);
        Object.keys(element).forEach(key => {
            const original = element[key];
            if (typeof original === 'string') {
                console.log(`Original ${key}: ${original}`);
                element[key] = original.split(',').map(id => {
                    const trimmedId = id.trim();
                    const name = idToNameMap[trimmedId];
                    if (name) {
                        console.log(`Replacing ID ${trimmedId} with link to ${name}`);
                        return `[[${name}]]`;
                    } else {
                        console.log(`No name found for ID ${trimmedId}, leaving as is`);
                        return trimmedId;
                    }
                }).join(', ');
                console.log(`Updated ${key}: ${element[key]}`);
            }
        });
        return element;
    }
    

    
      // Helper method for linkify
      linkify(id: string): string {
        return `[[${id}]]`;

        // log data lement again to see changes
      }
      private extractIdFromContent(content: string): string | null {
        // This regex matches the ID line regardless of the field type specified in data-tooltip
        const match = content.match(/<span class="[^"]*" data-tooltip="[^"]*">ID<\/span>:\s*([^\n]+)/);
        return match ? match[1].trim() : null;
    }
    
 
}



interface Element {
    [key: string]: string;  // Adjust according to actual data structure
  }
  
  interface IdToNameMap {
    [id: string]: string;
  }