import { App, PluginManifest, TFile, normalizePath } from 'obsidian';

export class CreateReadmeCommand {
    private app: App;
    private manifest: PluginManifest;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }

    async execute(): Promise<void> {
        const settingsPath = normalizePath('OnlyWorlds/Readme.md');
        const fileExists = await this.app.vault.adapter.exists(settingsPath);

        if (!fileExists) {
            const content = `# OnlyWorlds Readme

 Draft readme for GPT:
 



`;

            await this.app.vault.create(settingsPath, content); 
        } else { 
            const file = this.app.vault.getAbstractFileByPath(settingsPath);
            if (file instanceof TFile) {
                this.app.workspace.openLinkText(file.basename, file.path, false);
            }
        }
    }
}
