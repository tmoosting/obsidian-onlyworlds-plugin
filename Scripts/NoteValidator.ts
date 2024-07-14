import { Notice, TFile, Vault } from 'obsidian';

export class NoteValidator {
    private vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }

    setupValidationListeners() {
        this.vault.on('modify', (file: TFile) => {
            // Check if the file is a Markdown file by extension
            if (file.extension === 'md') {
                this.validateNote(file);
            }
        });
    }

    private validateNote(file: TFile) {
        // Example: Validate based on file path or other identifiers
        if (file.path.includes('/Character/')) {
            this.validateCharacter(file);
        }
        // Additional category checks can be added here
    }

    private async validateCharacter(file: TFile) {
        console.log ('val CHAR');
        const content = await this.vault.read(file);
        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.startsWith('- **Birthplace:')) {
        console.log ('line.startsWith(Birthplace:');

                const birthDate = parseInt(line.replace('- **Birthplace:', '').trim());
                if (isNaN(birthDate) || birthDate < 0 || birthDate > 150) {
                    new Notice('Invalid Birth Date specified in ' + file.name);
                }
            }
        });
    }
    // Additional methods for validating other categories
}
