import { App, Notice, requestUrl, FileSystemAdapter, normalizePath, TFile } from 'obsidian';
import { Category } from '../enums';
import { WorldKeySelectionModal } from 'Modals/WorldKeySelectionModal';
import { ValidateWorldCommand } from './ValidateWorldCommand';
import { WorldService } from 'Scripts/WorldService';
import { ValidateExportResultModal } from 'Modals/ValidateExportResultModal';

export class ExportWorldCommand {
    app: App;
    manifest: any;
    worldService: WorldService;

    private apiUrl = 'https://www.onlyworlds.com/api/worlddata/';

    constructor(app: App, manifest: any,  worldService: WorldService,) {
        this.app = app;
        this.manifest = manifest;
        this.worldService = worldService;
    }

    async execute() {
        const activeWorldName = await this.worldService.getWorldName(); // Fetch the active world name
        new WorldKeySelectionModal(this.app, async (worldKey: string, worldFolder: string) => {
            if (worldKey.length === 10) {
                const validator = new ValidateWorldCommand(this.app, this.manifest, this.worldService, false);
                await validator.execute(worldFolder); // Pass the chosen world folder name
        
                const validationModal = new ValidateExportResultModal(this.app, validator.errors, validator.elementCount, validator.errorCount, worldFolder);
        
                validationModal.setExportCallback(async () => {
                    if (validator.errorCount === 0) {
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
                    }
                });
        
                validationModal.open();
            } else {
                new Notice('Invalid world key. Please ensure it is a 10-digit number.');
            }
        }, activeWorldName).open(); // Pass the active world name to the modal
    }
    
    
    

    async collectWorldData(worldFolder: string) {
        const fs: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
        let worldData: Record<string, any> = {};  // Change from any[] to any for flexible indexing
    
        // Path to the 'World' file inside the selected world folder
        const worldFilePath = normalizePath(`OnlyWorlds/Worlds/${worldFolder}/World.md`);
    
        // Read the 'World' file content and parse it
        try {
            const worldFileContent = await fs.read(worldFilePath);
        //    console.log(`Reading World file: ${worldFilePath}`);
            const worldInfo = this.parseWorldFile(worldFileContent);
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
                //    console.log(`Reading file: ${file.path}`);
                    return await this.parseTemplate(fileContent);
                }));
    
                // Filter out empty entries
                worldData[category] = categoryData.filter(item => Object.keys(item).length > 0);
            }
        }
    
        console.log(`Final world data: ${JSON.stringify(worldData)}`);
        return worldData;
    }
    
    private parseWorldFile(content: string): Record<string, string> {
        let currentSection: string | null = null;
        const data: Record<string, string> = {};
    
        const sectionPattern = /^##\s*(.+)$/; // Pattern to identify sections
        const keyValuePattern = /- \*\*(.*?):\*\* (.*)/; // Pattern for key-value pairs
    
        const lines = content.split('\n');
        lines.forEach(line => {
            const sectionMatch = line.match(sectionPattern);
            if (sectionMatch) {
                currentSection = this.toSnakeCase(sectionMatch[1]);
                return;
            }
    
            const match = line.match(keyValuePattern);
            if (match) {
                let key = this.toSnakeCase(match[1].replace(/\*\*/g, ''));
                const value = match[2].trim();
                data[key] = value;
            }
        });
    
        return data;
    }
    
    
    
    private async extractLinkedIds(linkedText: string, lineText: string): Promise<string[]> {
        const linkPattern = /\[\[(.*?)\]\]/g;
        const ids: string[] = [];
        let match;
    
        // Extract world name from the active file path
        const currentFile = this.app.workspace.getActiveFile();
        const worldName = currentFile ? this.extractWorldName(currentFile.path) : "Unknown World";
      //  console.log(`Current file path: ${currentFile?.path}`);
      //  console.log(`Extracted world name: ${worldName}`);
    
        // Extract the element type from the surrounding line context
        const elementTypeMatch = /data-tooltip="(Single|Multi) ([^"]+)"/.exec(lineText);
        const elementType = elementTypeMatch ? elementTypeMatch[2] : null;
      //  console.log(`Line text: ${lineText}`);
     //   console.log(`Element type match: ${elementTypeMatch}`);
       // console.log(`Extracted element type: ${elementType}`);
    
        if (!elementType) {
            console.error("Element type not found in the linked text");
            return ids;
        }
    
        while ((match = linkPattern.exec(linkedText)) !== null) {
            const noteName = match[1];
         //   console.log(`Processing link: ${noteName}`);
    
            // Build the correct file path based on the world name and element type
            const linkedFilePath = normalizePath(`OnlyWorlds/Worlds/${worldName}/Elements/${elementType}/${noteName}.md`);
         //   console.log(`Resolved file path: ${linkedFilePath}`);
    
            const linkedFile = this.app.vault.getAbstractFileByPath(linkedFilePath);
    
            if (linkedFile && linkedFile instanceof TFile) {
                console.log(`Found linked file: ${linkedFilePath}`);
                const fileContent = await this.app.vault.read(linkedFile);
                const { id } = this.parseElement(fileContent); // Assumes parseElement can extract 'id' from note
                ids.push(id);
             //   console.log(`Extracted ID: ${id} from note: ${noteName}`);
            } else {
                console.error(`Linked file not found: ${noteName}`);
            }
        }
        return ids;
    }
    
    async parseTemplate(content: string): Promise<Record<string, string>> {
        let currentSection: string | null = null;
        const data: Record<string, string> = {};
    
        const sectionPattern = /^##\s*(.+)$/; // Pattern to identify sections
        const keyValuePattern = /- <span class="[^"]+" data-tooltip="[^"]+">(.+?)<\/span>:\s*(.*)/; // Pattern for key-value pairs
    
        const lines = content.split('\n');
        for (const line of lines) {
            const sectionMatch = line.match(sectionPattern);
            if (sectionMatch) {
                currentSection = this.toSnakeCase(sectionMatch[1]);
             //   console.log(`Current section: ${currentSection}`);
                continue;
            }
    
            const match = line.match(keyValuePattern);
            if (match) {
                let key = this.toSnakeCase(match[1].replace(/\*\*/g, ''));
                const value = match[2].trim();
             //   console.log(`Found key: ${key}, value: ${value}`);
    
                if (value.startsWith('[[')) {
                    // If value contains links, extract IDs
                    const ids = await this.extractLinkedIds(value, line);
                    data[key] = ids.join(',');
                  //  console.log(`Extracted IDs for key ${key}: ${data[key]}`);
                } else {
                    data[key] = value;
                }
            } else {
               // console.log(`No match for line: ${line}`);
            }
        }
    
        console.log(`Parsed data: ${JSON.stringify(data)}`);
        return data;
    }
    
    
    private extractWorldName(filePath: string): string {
        const pathParts = filePath.split('/');
        const worldIndex = pathParts.indexOf('Worlds');
        if (worldIndex !== -1 && pathParts.length > worldIndex + 1) {
            return pathParts[worldIndex + 1];
        }
        return "Unknown World";  // Default if the world name cannot be determined
    }
    
    private parseElement(content: string): { name: string, id: string } {
        console.log("Parsing element content...");
        // Adjust the regex to capture the full ID including dashes
        const idMatch = content.match(/<span class="text-field" data-tooltip="Text">Id<\/span>:\s*([^\s<]+)/);
        const nameMatch = content.match(/<span class="text-field" data-tooltip="Text">Name<\/span>:\s*([^\s<]+)/);
        
        const id = idMatch ? idMatch[1].trim() : "Unknown Id";
        const name = nameMatch ? nameMatch[1].trim() : "Unnamed Element";
        
        console.log(`Parsed Id: ${id}`);
        console.log(`Parsed Name: ${name}`);
        
        return { id, name };
    }

    // stop at dash 
    // private parseElement(content: string): { id: string } {
    //     const idMatch = content.match(/<span class="text-field" data-tooltip="Text">ID<\/span>:\s*([^<\r\n-]+)/);
    //     const id = idMatch ? idMatch[1].trim() : "Unknown ID";
    //     return { id };
    // }

  
    // Helper method to convert strings to snake_case
    toSnakeCase(input: string): string {
        return input.toLowerCase().replace(/\s+/g, '_').replace(/\(|\)|,/g, '');
    }
}
