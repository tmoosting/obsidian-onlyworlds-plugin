import { App, TFolder, normalizePath } from 'obsidian';

export class WorldService {
  private app: App;
  private worldName: string = 'DefaultWorld'; // Default world name

  constructor(app: App) {
    this.app = app;
  }

  

  async getWorldName(): Promise <string> {
    const worldsPath = normalizePath('OnlyWorlds/Worlds');
    const worldsFolder = this.app.vault.getAbstractFileByPath(worldsPath);
    if (worldsFolder instanceof TFolder && worldsFolder.children.length > 0) {
      const subFolders = worldsFolder.children.filter(child => child instanceof TFolder);
      if (subFolders.length > 0) {
        this.worldName = subFolders[0].name;  
      }
    }


    return this.worldName;
  }
}
