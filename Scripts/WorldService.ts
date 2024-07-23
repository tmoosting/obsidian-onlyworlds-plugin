import { App, TFolder, TFile, normalizePath } from 'obsidian';

export class WorldService {
  private app: App;
  private worldName: string = 'DefaultWorld'; // Default world name as a fallback

  constructor(app: App) {
    this.app = app;
  }

  async getWorldName(): Promise<string> {
    const worldsPath = normalizePath('OnlyWorlds/Worlds');
    const worldsFolder = this.app.vault.getAbstractFileByPath(worldsPath);
    if (worldsFolder instanceof TFolder && worldsFolder.children.length > 0) {
      const subFolders = worldsFolder.children.filter(child => child instanceof TFolder);
      if (subFolders.length > 0) {
        const worldFolder = subFolders[0];
        console.log("world folder: "  + worldFolder);
        const worldFile = worldFolder.children.find(child => child instanceof TFile && child.name === 'World.md');
        if (worldFile instanceof TFile) {
          const content = await this.app.vault.read(worldFile);
          const extractedName = this.extractWorldNameFromContent(content);
          if (extractedName) {
            this.worldName = extractedName; // Update world name if found
          }
        }
      }
    }
    return this.worldName; // Return either the extracted or default world name
  }

  private extractWorldNameFromContent(content: string): string | null {
    const nameMatch = content.match(/^- \*\*Name:\*\* (.+)$/m); // Regex to match the specific name format
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1].trim(); // Return the captured world name, trimmed
    }
    return null; // Return null if no name is found
  }
}
