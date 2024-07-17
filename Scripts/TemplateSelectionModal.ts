import { App, Modal, DropdownComponent, Notice } from 'obsidian';
import { Category } from '../enums';

export class TemplateSelectionModal extends Modal {
    constructor(app: App, private executeCreation: (category: string) => void) {
        super(app);
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.createEl('h3', { text: 'Create new...' });
    
        // Create input field for category selection
        let inputEl = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'Type to select a category...'
        });
    
        // Assign ID to the input for the datalist association
        const dataListId = 'categories-list';
        inputEl.setAttribute('list', dataListId);
    
        // Create a datalist element and set the ID attribute manually
        let dataListEl = contentEl.createEl('datalist');
        dataListEl.id = dataListId;
    
        // Populate datalist with categories
        const categories = Object.keys(Category).filter(key => isNaN(Number(key)));
        categories.forEach(category => {
            dataListEl.createEl('option', { value: category });
        });
    
        // Handle selection or input
        inputEl.addEventListener('input', () => {
            const value = inputEl.value;
            if (categories.includes(value)) {
                this.executeCreation(value);
                this.close();
            } else {
                new Notice('Please select a valid category.');
            }
        });
    
        inputEl.addEventListener('change', () => {
            const value = inputEl.value;
            if (categories.includes(value)) {
                this.executeCreation(value);
                this.close();
            }
        });
    }
    
    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
    
}
