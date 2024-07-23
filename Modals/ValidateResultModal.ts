import { Modal, App } from 'obsidian';

export class ValidateResultModal extends Modal {
    private elementCount: number;
    private errorCount: number;

    constructor(app: App, elementCount: number, errorCount: number) {
        super(app);
        this.elementCount = elementCount;
        this.errorCount = errorCount;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h1', { text: 'World Validation Results' });

        // Display the summary of validation
        contentEl.createEl('p', { text: `Total elements scanned: ${this.elementCount}` });
        contentEl.createEl('p', { text: `Errors found: ${this.errorCount}` });

        // Provide a more detailed explanation or actions based on errors
        if (this.errorCount > 0) {
            contentEl.createEl('p', { text: 'Issues detected during validation. Please review the problematic elements and try again.' });
        } else {
            contentEl.createEl('p', { text: 'No issues detected. Your world data appears to be in good shape!' });
        }

        // Add a close button for user convenience
        const closeButton = contentEl.createEl('button', {
            text: 'Close',
            cls: 'mod-cta'
        });
        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
