import { App, Notice, FileSystemAdapter, TFile, normalizePath, TFolder, PluginManifest } from 'obsidian';
import { Category } from '../enums'; // Ensure this import is correct
import { ValidateResultModal } from 'Modals/ValidateResultModal'; // Ensure path is correct

export class ValidateWorldCommand {
    app: App;
    manifest: PluginManifest;

    // Declaring error lists
    errors = {
        numberStringErrors: [] as string[],
        maxNumberStringErrors: [] as string[],
        singleLinkFieldErrors: [] as string[],
        multiLinkFieldErrors: [] as string[],
        missingIdErrors: [] as string[],
        nameMismatchErrors: [] as string[],
        worldFileErrors: [] as string[]
    };

    elementCount: number = 0;
    errorCount: number = 0;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        console.log("Starting world validation...");
    
        const worldFolderName = await this.determineTopWorldFolder();
        const worldFolderPath = normalizePath(`OnlyWorlds/Worlds/${worldFolderName}/Elements`);
        const elementsFolder = this.app.vault.getAbstractFileByPath(worldFolderPath) as TFolder;
    
        if (!elementsFolder || !(elementsFolder instanceof TFolder)) {
            console.error('Elements folder not found.');
            return;
        }
    
        for (const categoryKey in Category) {
            const category = Category[categoryKey];
            if (!isNaN(Number(category))) continue; // Skip if category is not a string
    
            const categoryPath = normalizePath(`${worldFolderPath}/${category}`);
            const categoryFolder = this.app.vault.getAbstractFileByPath(categoryPath) as TFolder;
    
            if (!categoryFolder || !(categoryFolder instanceof TFolder)) {
                console.log(`No elements found in category: ${category}`);
                continue;
            }
     
            for (const file of categoryFolder.children) {
                if (file instanceof TFile) {
                    this.elementCount++;
                    const content = await this.app.vault.read(file);
                    this.validateElement(file.name, content);
                }
            }
        }
    
        console.log(`Validation complete. Total elements scanned: ${this.elementCount}, Errors found: ${this.errorCount}`);
        new ValidateResultModal(this.app, this.errors, this.elementCount, this.errorCount, worldFolderName).open();
    }
    

    async determineTopWorldFolder(): Promise<string> {
        const worldsPath = normalizePath('OnlyWorlds/Worlds');
        const worldsFolder = this.app.vault.getAbstractFileByPath(worldsPath);
        if (worldsFolder instanceof TFolder) {
            const subFolders = worldsFolder.children.filter(child => child instanceof TFolder);
            return subFolders.length > 0 ? subFolders[0].name : 'DefaultWorld';
        }
        return 'DefaultWorld';
    }

    validateWorldFile(content: string): boolean {
        const idMatch = content.match(/ID:\s*(\S+)/);
        const nameMatch = content.match(/Name:\s*(\S+)/);
        if (!idMatch || !nameMatch) {
            this.errorCount++;
            this.errors.worldFileErrors.push(`World file format error detected: please check ID and Name fields each have values`);
            return false;
        }
        return true;
    }
    
    validateElement(fileName: string, content: string) {
        let idFound = false;
        let nameFound = false;
        const lines = content.split('\n');
    
        lines.forEach(line => {
            if (!line.trim()) return;  // Skip empty or whitespace-only lines
    
            if (line.includes('number-field')) {
                const numberPart = line.split(':').pop();
                if (numberPart && numberPart.trim()) {
                    // Extracting the number from the content
                    const numberMatch = numberPart.trim().match(/^(\d+)$/);
                    if (numberMatch) {
                        const number = parseInt(numberMatch[1], 10);
                        // Check if there's a max value specified in the field
                        const maxMatch = line.match(/max:\s*(\d+)/);
                        if (maxMatch) {
                            const max = parseInt(maxMatch[1], 10);
                            if (number > max) {
                                this.errorCount++;
                                const displayName = fileName.replace('.md', '');
                                this.errors.maxNumberStringErrors.push(`${displayName} has error in ${line}: max value exceeded`);
                            }
                        }
                    } else {
                        this.errorCount++;
                        const displayName = fileName.replace('.md', ''); 
                        this.errors.numberStringErrors.push(`${displayName} has error in ${line}: Invalid or missing number`);

                    }
                }
            }
    
            if (line.includes('link-field')) {
                const parts = line.split(':');
                const contentAfterColon = parts.length > 1 ? parts[1].trim() : '';
                if (contentAfterColon) {
                    const linkMatches = contentAfterColon.match(/\[\[[^\]]+\]\]/g);
                    if (linkMatches && linkMatches.length == 1) {
                        // Valid single link field
                    } else if (!linkMatches || linkMatches.length == 0) {
                        this.errorCount++;
                        this.errors.singleLinkFieldErrors.push(`Invalid link format in single link field: ${line} in ${fileName}`);
                    }
                }
            }
    
            if (line.includes('multi-link-field')) {
                const parts = line.split(':');
                const contentAfterColon = parts.length > 1 ? parts[1].trim() : '';
                if (contentAfterColon) {
                    const linkMatches = contentAfterColon.match(/\[\[[^\]]+\]\]/g);
                    if (linkMatches && linkMatches.length > 1) {
                        // Valid multi-link field
                    } else {
                        this.errorCount++;
                        this.errors.multiLinkFieldErrors.push(`Invalid format in multi-link field: ${line} in ${fileName}`);
                    }
                }
            }
    
            // Validation for ID field being non-empty
            if (line.includes('<span class="text-field" data-tooltip="Text">ID</span>:')) {
                const parts = line.split(':');
                const idValue = parts.length > 1 ? parts[1].trim() : '';
                if (!idValue) {
                    this.errorCount++;
                    this.errors.missingIdErrors.push(`ID field is empty in ${fileName}`);
                } else {
                    idFound = true;
                }
            }
    
            // Validation for Name field matching the file name
            if (line.includes('<span class="text-field" data-tooltip="Text">Name</span>:')) {
                const parts = line.split(':');
                const nameValue = parts.length > 1 ? parts[1].trim().replace(/["']/g, "") : ''; // Removing potential quotation marks
                if (!nameValue || nameValue !== fileName.replace('.md', '')) {
                    this.errorCount++;
                    this.errors.nameMismatchErrors.push(`Name field does not match file name in ${fileName}`);
                } else {
                    nameFound = true;
                }
            }
        });
    
        
    }
    

    
}

