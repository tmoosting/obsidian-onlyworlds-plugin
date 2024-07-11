import { App, Notice, requestUrl, FileSystemAdapter, normalizePath } from 'obsidian';
import Handlebars from 'handlebars';
import { Category } from '../enums';
import { WorldKeyModal } from 'Scripts/WorldKeyModal';  

export class SendWorldCommand {
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
                    const worldData = await this.collectWorldData();
                    const response = await requestUrl({
                        url: this.apiUrl + worldKey,  // Ensure this is the intended endpoint
                        method: 'POST',
                        contentType: 'application/json',
                        body: JSON.stringify({  // 'body' instead of 'data'
                            worldKey: worldKey,
                            worldData: worldData
                        })
                    });
                    
                    if (response.status === 200 || response.status === 201) {
                        new Notice('World data successfully sent.');
                    } else {
                        new Notice('Failed to send world data: ' + response.status);
                    }
                } catch (error) {
                    console.error('Error sending world data:', error);
                    new Notice('Error sending world data: ' + error.message);
                }
            } else {
                new Notice('Invalid world key. Please ensure it is a 10-digit number.');
            }
        }).open();
    }

    async collectWorldData() {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        let worldData: Record<string, any> = {};
    
        for (const categoryKey in Category) {
            const category = Category[categoryKey];
            if (isNaN(Number(category))) {
                const categoryDirectory = normalizePath(`Elements/${category}`);
                const files = this.app.vault.getFiles().filter(file => file.path.startsWith(categoryDirectory));
    
                console.log(`Collecting data for category: ${category}`);
                worldData[category] = await Promise.all(files.map(async (file) => {
                    const fileContent = await fs.read(file.path);
                    console.log(`Reading file: ${file.path}`);
                    const data = this.parseTemplate(fileContent);
         //           console.log(`Data parsed from file: ${JSON.stringify(data)}`);
                    return data;
                }));
            }
        }
    
        console.log(`Final collected world data: ${JSON.stringify(worldData)}`);
        return worldData;
    }
    
    
    parseTemplate(content: string): any {
        const data: Record<string, any> = {};
    
        // First, extract the header with id, name, supertype, subtype, and species
        const headerPattern = /---\nid: (.*)\nname: (.*)\nsupertype: (.*)\nsubtype: (.*)\nspecies: (.*)\n---/;
        const headerMatch = content.match(headerPattern);
        if (headerMatch) {
            data['id'] = headerMatch[1].trim();
            data['name'] = headerMatch[2].trim();
            data['supertype'] = headerMatch[3].trim();
            data['subtype'] = headerMatch[4].trim();
            data['species'] = headerMatch[5].trim();
        }
    
        // Extracting simple key-value pairs from Handlebars output
        const lines = content.split('\n');
        lines.forEach(line => {
            // Match lines like "- **Description:** Value"
            const match = line.match(/- \*\*(.*?):\*\* (.*)/);
            if (match) {
                const key = match[1].toLowerCase().replace(/\s+/g, '_'); // Convert "General Information" to "general_information"
                const value = match[2].trim();
                data[key] = value;
            }
        });
    
        return data;
    }
    
    
    
}
