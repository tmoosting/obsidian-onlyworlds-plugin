import { Modal, App } from 'obsidian';

export class ValidateResultModal extends Modal {
    private errors: {
        numberStringErrors: string[],
        maxNumberStringErrors: string[],
        singleLinkFieldErrors: string[],
        multiLinkFieldErrors: string[],
        missingIdErrors: string[],
        nameMismatchErrors: string[],
        worldFileErrors: string[]
    };
    private elementCount: number;
    private errorCount: number;
    private worldName: string;

    constructor(app: App, errors: { 
        numberStringErrors: string[], 
        maxNumberStringErrors: string[], 
        singleLinkFieldErrors: string[], 
        multiLinkFieldErrors: string[], 
        missingIdErrors: string[], 
        nameMismatchErrors: string[], 
        worldFileErrors: string[]
    }, elementCount: number, errorCount: number, worldName: string) {
        super(app);
        this.errors = errors;
        this.elementCount = elementCount;
        this.errorCount = errorCount;
        this.worldName = worldName;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h1', { text: `Validating ${this.worldName}` });

        // Display the summary of validation
        contentEl.createEl('p', { text: `Total elements scanned: ${this.elementCount}, Errors found: ${this.errorCount}` });

        const errorKeys = Object.keys(this.errors) as (keyof typeof this.errors)[];
        errorKeys.forEach(key => {
            const errorList = this.errors[key];
            if (errorList.length > 0) {
                const errorSection = contentEl.createDiv();
                errorSection.createEl('h2', { text: `${this.formatTitle(key)} Errors` });
                errorList.forEach((error: string) => {
                    errorSection.createEl('p', { text: error });
                });
            }
        });

        const closeButton = contentEl.createEl('button', {
            text: 'Close',
            cls: 'mod-cta'
        });
        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    formatTitle(key: string): string {
        return key.replace(/([A-Z])/g, ' $1').trim();
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
