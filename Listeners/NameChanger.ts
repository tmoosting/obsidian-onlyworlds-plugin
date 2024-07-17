import { Category } from 'enums';
import { App, Plugin, MarkdownView, Notice, TFile } from 'obsidian';

export class NameChanger extends Plugin {
    setupNameChangeListener() {
        // Listen for file changes to sync names
        this.app.vault.on('modify', (file: TFile) => {
            if (file instanceof TFile && file.extension === 'md') {
                this.checkAndSyncNameField(file);
            }
        });

        // Listen for file opening to highlight name fields
        this.registerEvent(
            this.app.workspace.on('file-open', (file: TFile) => {
                if (file instanceof TFile && file.extension === 'md') {
                    this.highlightNameField(file);
                }
            })
        );
    }

    async checkAndSyncNameField(file: TFile) {
        const fileContent = await this.app.vault.read(file);
        const nameRegex = /<span class="text-field" data-tooltip="Text">Name<\/span>:\s*(.+)/;
        const nameMatch = fileContent.match(nameRegex);

        if (nameMatch && nameMatch[1].trim() !== file.basename) {
            const updatedContent = fileContent.replace(nameRegex, `<span class="text-field" data-tooltip="Text">Name</span>: ${file.basename}`);
            await this.app.vault.modify(file, updatedContent);
        }
    }

    async highlightNameField(file: TFile) {
        const fileContent = await this.app.vault.read(file);
        const categoryName = this.getCategoryFromFileName(file.basename);
        if (categoryName) {
            const defaultNamePattern = new RegExp(`name: New ${categoryName}`, 'i');

            if (defaultNamePattern.test(fileContent)) {
                new Notice("Please update the name fields.");
                // You can implement UI highlighting here if the API supports or requires it
            }
        }
    }

    getCategoryFromFileName(fileName: string): string | null {
        const parts = fileName.split(' ');
        if (parts.length > 1) {
            const categoryPart = parts[1];
            const category = Category[categoryPart as keyof typeof Category];
            return category !== undefined ? Category[category] : null;
        }
        return null;
    }
}
 
 