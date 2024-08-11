import { Modal, App } from 'obsidian';

export class WorldCopyModal extends Modal {
    message: string;

    constructor(app: App, message: string) {
        super(app);
        this.message = message;
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.createEl('h3', { text: this.message });
        contentEl.createEl('button', { text: 'OK', type: 'button' }, (button) => {
            button.onclick = () => this.close();
        });
    }

    onClose() {
        this.contentEl.empty();
    }
}
