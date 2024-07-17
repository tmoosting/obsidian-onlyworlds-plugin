import { App, Modal, Notice, DropdownComponent } from 'obsidian';
import { Category } from '../enums';

export class TemplateSelectionModal extends Modal {
    constructor(app: App, private executeCreation: (category: string) => void) {
        super(app);
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.setText('Select a category for the new element:');

        const dropdown = new DropdownComponent(contentEl);

        // Populate dropdown with categories
        Object.keys(Category).forEach(category => {
            dropdown.addOption(category, category);
        });

        dropdown.onChange(value => {
            // Execute creation with selected category
            this.executeCreation(value);
            this.close();
        });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
