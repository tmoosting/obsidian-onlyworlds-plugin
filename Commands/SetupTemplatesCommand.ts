import { App, Notice } from 'obsidian';
import { Category } from 'enums'; // Adjust path as needed

export class SetupTemplatesCommand {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async execute() {
        const templatesPath = "/Templates/";
        for (const category in Category) {
            if (isNaN(Number(category))) { // Check to only use string keys, not numeric values
                const templateFileName = category + ".md";
                const templateExists = await this.app.vault.adapter.exists(templatesPath + templateFileName);

                if (!templateExists) {
                    try {
                        const internalTemplatePath = this.app.manifest.dir + `/Templates/${templateFileName}`;
                        const templateContent = await this.app.vault.adapter.read(internalTemplatePath);
                        await this.app.vault.create(templatesPath + templateFileName, templateContent);
                        new Notice(`Template created: ${templateFileName}`);
                    } catch (error) {
                        console.error(`Error setting up template ${templateFileName}: `, error);
                    }
                } else {
                    console.log(`Template already exists: ${templateFileName}`);
                }
            }
        }
    }
}
