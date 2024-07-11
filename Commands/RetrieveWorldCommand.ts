import { App, Notice, Plugin, Modal, requestUrl } from 'obsidian';

class WorldKeyModal extends Modal {
    onEnter: (value: string) => void;

    constructor(app: App, onEnter: (value: string) => void) {
        super(app);
        this.onEnter = onEnter;
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.createEl('h3', { text: 'Enter World Key' });

        const input = contentEl.createEl('input', {
            type: 'text',
            placeholder: '10-digit World Key'
        });

        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.close();
                this.onEnter(input.value);
            }
        });

        input.focus();
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

export class RetrieveWorldCommand {
    app: App;
    manifest: any;
    private apiUrl = 'https://www.onlyworlds.com/api/worlddata/';

    constructor(app: App, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute() {
        new WorldKeyModal(this.app, async (worldKey: string) => {
            if (worldKey.length === 10) {
                try {
                    const response = await requestUrl({
                        url: this.apiUrl + worldKey,
                        method: 'GET'
                    });
                    if (response.status !== 200) {
                        new Notice('Failed to fetch world data: ' + response.status);
                        return;
                    }
                    const data = JSON.parse(response.text);
                    console.log(data);  // Output the fetched world data to console
                } catch (error) {
                    console.error('Error fetching world data:', error);
                    new Notice('Error fetching world data: ' + error.message);
                }
            } else {
                new Notice('Invalid world key. Please ensure it is a 10-digit number.');
            }
        }).open();
    }
}
