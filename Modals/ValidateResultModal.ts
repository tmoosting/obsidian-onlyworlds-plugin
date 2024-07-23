import { Modal, App } from 'obsidian';

export class ValidateResultModal extends Modal {
    private errors: {
        numberErrors: string[], 
        maxNumberErrors: string[], 
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
        numberErrors: string[], 
        maxNumberErrors: string[], 
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

        contentEl.createEl('h1', { text: `World Validation Results for ${this.worldName}` });

        contentEl.createEl('p', { text: `Total elements scanned: ${this.elementCount}` });
        contentEl.createEl('p', { text: `Errors found: ${this.errorCount}` });

        if (this.errorCount > 0) {
            contentEl.createEl('p', { text: `Please correct below issues before exporting ${this.worldName}.` });
        } else {
            contentEl.createEl('p', { text: `No issues detected. ${this.worldName} is ready for export!` });
        }

        const errorKeys = Object.keys(this.errors) as (keyof typeof this.errors)[];
        let totalErrors = 0;
        errorKeys.forEach(key => {
            const errorList = this.errors[key];
            if (errorList.length > 0) {
                totalErrors += errorList.length;
                const errorSection = contentEl.createDiv();
                errorSection.createEl('h2', { text: `${this.formatTitle(key)}` });
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
        return key.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, char => char.toUpperCase());
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
