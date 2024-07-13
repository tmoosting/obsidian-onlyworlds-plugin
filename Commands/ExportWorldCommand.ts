import { App, Notice, requestUrl, FileSystemAdapter, normalizePath } from 'obsidian';
import Handlebars from 'handlebars';
import { Category } from '../enums';
import { WorldKeySelectionModal } from 'Scripts/WorldKeySelectionModal';  

export class ExportWorldCommand {
    app: App;
    manifest: any;
    private apiUrl = 'https://www.onlyworlds.com/api/worlddata/';

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        new WorldKeySelectionModal(this.app, async (worldKey: string, worldFolder: string) => {
            if (worldKey.length === 10) {
                try {
                    const worldData = await this.collectWorldData(worldFolder);  // Pass the selected world folder
                    const payload = {
                        worldKey: worldKey,
                        worldData: worldData
                    };

                    console.log(`Sending data to URL: ${this.apiUrl}`);

                    const response = await requestUrl({
                        url: this.apiUrl,
                        method: 'POST',
                        contentType: 'application/json',
                        body: JSON.stringify(payload)
                    });

                    if (response.status === 200 || response.status === 201) {
                        new Notice('World data successfully sent. Status: ' + response.status);
                    } else {
                        console.error(`Failed to send world data, status code: ${response.status}`);
                        new Notice(`Failed to send world data: ${response.status}`);
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
    async collectWorldData(worldFolder: string) {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        let worldData: Record<string, any> = {};  // Change from any[] to any for flexible indexing
    
        // Path to the 'World' file inside the selected world folder
        const worldFilePath = normalizePath(`OnlyWorlds/Worlds/${worldFolder}/World.md`);
    
        // Read the 'World' file content and parse it
        try {
            const worldFileContent = await fs.read(worldFilePath);
            console.log(`Reading World file: ${worldFilePath}`);
            const worldInfo = this.parseTemplate(worldFileContent);
            worldData['World'] = worldInfo; // Directly assign the object, not in an array
        } catch (error) {
            console.error('Error reading World file:', error);
            new Notice('Failed to read World file: ' + error.message);
            return {}; // Stop further processing if the World file cannot be read
        }
    
        // Iterate over categories to collect their data
        for (const categoryKey in Category) {
            const category = Category[categoryKey];
            if (isNaN(Number(category))) {
                const categoryDirectory = normalizePath(`OnlyWorlds/Worlds/${worldFolder}/Elements/${category}`);
                const files = this.app.vault.getFiles().filter(file => file.path.startsWith(categoryDirectory));
    
                console.log(`Collecting data for category: ${category}`);
                const categoryData = await Promise.all(files.map(async (file) => {
                    const fileContent = await fs.read(file.path);
                    console.log(`Reading file: ${file.path}`);
                    return this.parseTemplate(fileContent);
                }));
    
                // Filter out empty entries
                worldData[category] = categoryData.filter(item => Object.keys(item).length > 0);
            }
        }
    
        console.log(`Final world data: ${JSON.stringify(worldData)}`);
        return worldData;
    }
    

    parseTemplate(content: string): Record<string, string> {
        let currentSection: string | null = null;
        const data: Record<string, string> = {};

        const sectionPattern = /^##\s*(.+)$/; // Pattern to identify sections
        const keyValuePattern = /- \*\*(.*?):\*\* (.*)/; // Pattern for key-value pairs

        const lines = content.split('\n');
        lines.forEach(line => {
            const sectionMatch = line.match(sectionPattern);
            if (sectionMatch) {
                currentSection = sectionMatch[1].toLowerCase().replace(/\s+/g, '_');
                return;
            }

            const match = line.match(keyValuePattern);
            if (match) {
                let key = match[1].replace(/\*\*|\s/g, '').toLowerCase();
                const value = match[2].trim();
                data[key] = value;
            }
        });

        return data;
    } 
}
