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
                    const url = `${this.apiUrl}${worldKey}`; // Ensure there is no slash error
                    console.log(`Sending data to URL: ${url}`); // Log the URL being hit
                    
                    const response = await requestUrl({
                        url: url,
                        method: 'POST',
                        contentType: 'application/json',
                        body: JSON.stringify(worldData) // Ensure that the body is correctly formatted
                    });
                    
                    if (response.status === 200 || response.status === 201) {
                        new Notice('World data successfully sent.');
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
                console.log(`Data parsed from file: ${JSON.stringify(data)}`);
                    return data;
                }));
            }
        }
    
        console.log(`${JSON.stringify(worldData)}`);
        return worldData;
    }
    
      parseTemplate(content: string): Record<string, string> {
        let currentSection: string | null = null;  // Use more specific types instead of 'any'
        const data: Record<string, string> = {};
    
        const sectionPattern = /^##\s*(.+)$/; // Pattern to identify sections
        const keyValuePattern = /- \*\*(.*?):\*\* (.*)/; // Pattern for key-value pairs
    
        const lines = content.split('\n');
        lines.forEach(line => {
            const sectionMatch = line.match(sectionPattern);
            if (sectionMatch) {
                currentSection = sectionMatch[1].toLowerCase().replace(/\s+/g, '_');
                return; // Continue to next iteration in forEach
            }
    
            const match = line.match(keyValuePattern);
            if (match) {
                const key = (currentSection ? currentSection + '_' : '') + match[1].trim().toLowerCase().replace(/\s+/g, '_');
                const value = match[2].trim();
                data[key] = value;
            }
        });
    
        return data;
    }
    
    
    
    
}
