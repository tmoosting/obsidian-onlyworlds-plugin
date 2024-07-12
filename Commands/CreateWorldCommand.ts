import { App, Notice, FileSystemAdapter, TFile, PluginManifest } from 'obsidian';
 

import Handlebars from 'handlebars';
import { resolve } from 'path';
import { Category } from '../enums';
import { CreateTemplatesCommand } from './CreateTemplatesCommand'; // Ensure correct path
import { WorldNameModal } from 'Scripts/WorldNameModal';

export class CreateWorldCommand {
    app: App;
    manifest: PluginManifest;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }


    async execute() {
        console.log("execute 1");

        try {
            const worldName = await this.getWorldName();
            console.log("World Name:", worldName);
            if (!worldName) {
                console.log("No world name provided, exiting...");
                return;  // User cancelled the input
            }

            const worldBasePath = `OnlyWorlds/${worldName}`;
            await this.createFolderIfNeeded(worldBasePath);
            const elementsPath = `${worldBasePath}/Elements`;
            await this.createFolderIfNeeded(elementsPath);
            console.log("execute 2");

            for (const category in Category) {
                if (isNaN(Number(category))) {
                    await this.createFolderIfNeeded(`${elementsPath}/${category}`);
                }
            }

            const worldData = this.collectWorldData();
            const worldNoteContent = this.compileWorldNote(worldData);
            await this.app.vault.create(`${worldBasePath}/World.md`, worldNoteContent);

            const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);
            await createTemplatesCommand.execute();  
            new Notice('World successfully created!');
        } catch (error) {
            console.error("Error during world creation:", error);
            new Notice('Failed to create world.');
        }
    }

    async getWorldName(): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = new WorldNameModal(this.app, (value) => {
                resolve(value); // Modal will handle closure
            });
            modal.open();
        });
    }

  
    async createFolderIfNeeded(folderPath: string) {
        let existingFolder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!existingFolder) {
            try {
                await this.app.vault.createFolder(folderPath);
                new Notice(`Created folder: ${folderPath}`);
            } catch (error) {
                console.error(`Error creating folder: ${folderPath}`, error);
            }
        } else {
            console.log(`Folder already exists: ${folderPath}`);
        }
    }

    collectWorldData(): any {
        // Placeholder for collecting or generating initial world data
        return {
            id: "001",
            api_key: "API_KEY",
            name: "Hyperion",
            description: "A vibrant new world.",
            user_id: "default_user_id",
            ow_version: "16.00",
            image_url: "default_image_url",
            focus_text: "",
            time_format_names: "Eon, Era, Period, Epoch, Age, Year, Month, Day, Hour, Minute, Second",
            time_format_equivalents: "Eon, Era, Period, Epoch, Age, Year, Month, Day, Hour, Minute, Second",
            time_basic_unit: "Year",
            time_current: 0,
            time_range_min: 0,
            time_range_max: 100
        };
    }

    compileWorldNote(data: any): string {
        const templateString = `# World Overview: {{name}}

## Core
- **ID:** {{id}}
- **API Key:** {{api_key}}
- **Name:** {{name}}
- **Description:** {{description}}
- **User ID:** {{user_id}}
- **Version:** {{ow_version}}
- **Image URL:** ![World Image]({{image_url}})

## Time Settings
- **Focus Text:** {{focus_text}}
- **Time Formats:** {{time_format_names}}
- **Time Format Equivalents:** {{time_format_equivalents}}
- **Basic Time Unit:** {{time_basic_unit}}
- **Current Time:** {{time_current}}
- **Time Range:** From {{time_range_min}} to {{time_range_max}}`;

        const template = Handlebars.compile(templateString);
        return template(data);
    }
}
