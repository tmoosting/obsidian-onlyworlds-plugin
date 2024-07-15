import { App, Plugin, MarkdownView, Editor, Notice, WorkspaceLeaf, EditorPosition, Modal, Setting } from 'obsidian';

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

        if (this.elements.length === 0) {
            contentEl.createEl('p', { text: 'No elements found.' });
        } else {
            this.elements.forEach(element => {
                new Setting(contentEl)
                    .setName(element.name)
                    .setDesc(`ID: ${element.id}`)
                    .addButton(button => {
                        button.setButtonText('Select')
                            .onClick(() => {
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
