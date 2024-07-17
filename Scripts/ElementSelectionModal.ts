import { App, Modal, Setting } from 'obsidian';

export class ElementSelectionModal extends Modal {
    private elements: { name: string; id: string }[];
    private onSelect: (selectedElements: { name: string; id: string }[]) => void;

    constructor(app: App, elements: { name: string; id: string }[], onSelect: (selectedElements: { name: string; id: string }[]) => void) {
        super(app);
        this.elements = elements;
        this.onSelect = onSelect;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Select Elements' });
    
        console.log('Elements passed to modal:', this.elements); // Debug output right before processing
    
        if (!this.elements || this.elements.length === 0) {
            contentEl.createEl('p', { text: 'No elements found.' });
        } else {
            this.elements.forEach(element => {
                console.log(`Processing element: ${element.name}, ID: ${element.id}`); // Log each element being processed
                new Setting(contentEl)
                    .setName(element.name)
                    .setDesc(`ID: ${element.id}`)
                    .addButton(button => {
                        button.setButtonText('Select')
                            .onClick(() => {
                                console.log(`Element selected: ${element.name}`); // Log on selection
                                this.onSelect([element]);
                                this.close();
                            });
                    });
            });
        }
    }
    

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
