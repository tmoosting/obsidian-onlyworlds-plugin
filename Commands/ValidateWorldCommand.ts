import { App, Notice, FileSystemAdapter, TFile, PluginManifest } from 'obsidian';
 import { v7 as uuidv7 } from 'uuid';

import Handlebars from 'handlebars';
import { resolve } from 'path';
import { Category } from '../enums'; 
import { WorldNameModal } from 'Modals/WorldNameModal';

export class ValidateWorldCommand {
    app: App;
    manifest: PluginManifest;

    constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }


    async execute() {
        console.log("Starting world validation...");
 
    }
 
}
