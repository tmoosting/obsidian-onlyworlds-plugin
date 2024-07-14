import { Plugin } from 'obsidian';
import { Category } from 'enums'; 
import { CreateCategoryFoldersCommand } from './Commands/CreateCategoryFoldersCommand';
import { CreateTemplatesCommand } from './Commands/CreateTemplatesCommand';
import { ImportWorldCommand } from './Commands/ImportWorldCommand';
import { ExportWorldCommand } from 'Commands/ExportWorldCommand';
import { CreateWorldCommand } from 'Commands/CreateWorldCommand';
import { NoteValidator } from './Scripts/NoteValidator';

export default class OnlyWorldsPlugin extends Plugin {
    noteValidator: NoteValidator;

      onload(): void {
        this.noteValidator = new NoteValidator(this.app.vault);
        this.noteValidator.setupValidationListeners();

        this.setupCommands();
        this.preventClickExpansion();
        
        console.log("OW Plugin loaded");
      }
      preventClickExpansion(): void {
        this.app.workspace.onLayoutReady(() => {
            const textFields = document.querySelectorAll('.text-field');
            textFields.forEach(field => {
                field.addEventListener('click', (event) => {
                    console.log("TEXT STOP PROPAGATE");
                    event.stopPropagation(); // Prevents the click from affecting other elements
                });
            });
        });
    }
      setupCommands() {
       
        const createCategoryFoldersCommand = new CreateCategoryFoldersCommand(this.app, this.manifest);
        const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);
        const retrieveWorldCommand = new ImportWorldCommand(this.app, this.manifest);
        const sendWorldCommand = new ExportWorldCommand(this.app, this.manifest);        
        const createWorldCommand = new CreateWorldCommand(this.app, this.manifest);

        // Register a command to create category folders
        this.addCommand({
            id: 'create-category-folders',
            name: 'Create Element Folders',
            callback: () => {
                createCategoryFoldersCommand.execute();
            }
        });

        // Register a command to copy template files to user vault
        this.addCommand({
            id: 'setup-templates',
            name: 'Create Element Templates',
            callback: () => createTemplatesCommand.execute(),
        });


          // Register a command to fetch world data and convert to notes
        this.addCommand({
            id: 'import-world',
            name: 'Import World',
            callback: () => retrieveWorldCommand.execute(),
        });

             // Register a command to convert nodes and send as world data
        this.addCommand({
            id: 'export-world',
            name: 'Export World',
            callback: () => sendWorldCommand.execute(),
        });

             // Register a command to create a new world and OW file structures
        this.addCommand({
            id: 'create-world',
            name: 'Create World',
            callback: () => createWorldCommand.execute(),
        });
    }

   
}
