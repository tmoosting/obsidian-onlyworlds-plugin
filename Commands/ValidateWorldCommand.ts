import { App, Notice, FileSystemAdapter, TFile, normalizePath, TFolder, PluginManifest } from 'obsidian';
import { Category } from '../enums'; // Ensure this import is correct
import { ValidateResultModal } from 'Modals/ValidateResultModal'; // Ensure path is correct

export class ValidateWorldCommand {
    app: App;
    manifest: PluginManifest;
    errorCount: number = 0;
    elementCount: number = 0;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        console.log("Starting world validation...");
    
        // Reset counts each time the validation is run
        this.errorCount = 0;
        this.elementCount = 0;
    
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
    
            console.log(`Validating category: ${category}`);
            for (const file of categoryFolder.children) {
                if (file instanceof TFile) {
                    this.elementCount++;
                    const content = await this.app.vault.read(file);
                    this.validateElement(file.name, content);
                }
            }
        }
    
        console.log(`Validation complete. Total elements scanned: ${this.elementCount}, Errors found: ${this.errorCount}`);
        new ValidateResultModal(this.app, this.elementCount, this.errorCount).open();
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
        return !!idMatch && !!nameMatch;
    }
    validateElement(fileName: string, content: string) {
    console.log(`Validating element: ${fileName}`); // Output element name for reference
    const lines = content.split('\n');
    lines.forEach(line => {
        if (!line.trim()) return;  // Skip empty or whitespace-only lines
        if (line.includes('number-field')) {
            const numberPart = line.split(':').pop();
            if (numberPart && numberPart.trim()) {
                const numberMatch = numberPart.trim().match(/^(\d+)$/);
                if (!numberMatch) {
                    console.error(`Invalid or missing number in number field: ${line} in ${fileName}`);
                    this.errorCount++;
                }
            }
        }

        if (line.includes('link-field') || line.includes('multi-link-field')) {
            const parts = line.split(':');
            const contentAfterColon = parts.length > 1 ? parts[1].trim() : '';
            if (contentAfterColon) {
                const linkMatches = contentAfterColon.match(/\[\[[^\]]+\]\]/g);
                if (linkMatches) {
                    const linkContent = linkMatches.join('');
                    const cleanContent = contentAfterColon.replace(/,/g, '').replace(/\s/g, ''); // Remove commas and spaces for comparison
                    if (cleanContent !== linkContent.replace(/\s/g, '')) {
                        console.error(`Invalid or extra characters in link field: ${line} in ${fileName}`);
                        this.errorCount++;
                    }
                } else {
                    console.error(`Invalid link format in link field: ${line} in ${fileName}`);
                    this.errorCount++;
                }
            }
        }
    });
}

    
    
    
    
    
}
