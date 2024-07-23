import { App, Notice, PluginManifest, TFile, normalizePath } from 'obsidian';

export class CreateSettingsCommand {
    private app: App;
    private manifest: PluginManifest;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute(): Promise<void> {
        const settingsPath = normalizePath('OnlyWorlds/Settings.md');
        const fileExists = await this.app.vault.adapter.exists(settingsPath);

        if (!fileExists) {
            const content = `# OnlyWorlds Plugin Settings

## Primary World
- **Name:** {{Specify the exact name of the active world here. If empty or no match, top world in hierarchy is used for export, validation and element creation}}
 
`;

            await this.app.vault.create(settingsPath, content);
        //    new Notice('Settings note created successfully.');
        } else {
           // new Notice('Settings note already exists.');
            // Optionally, open the note for the user
            const file = this.app.vault.getAbstractFileByPath(settingsPath);
            if (file instanceof TFile) {
                this.app.workspace.openLinkText(file.basename, file.path, false);
            }
        }
    }
}
