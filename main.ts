import { Plugin } from 'obsidian';
import { Category } from 'enums'; 
import { CreateCategoryFoldersCommand } from './Commands/CreateCategoryFoldersCommand';
import { CreateTemplatesCommand } from './Commands/CreateTemplatesCommand';
import { ImportWorldCommand } from './Commands/ImportWorldCommand';
import { ExportWorldCommand } from 'Commands/ExportWorldCommand';
import { CreateWorldCommand } from 'Commands/CreateWorldCommand';
import { NoteLinker } from './Listeners/NoteLinker';
import Handlebars from 'handlebars';
import { CreateElementCommand } from 'Commands/CreateElementCommand';
import { TemplateSelectionModal } from 'Modals/TemplateSelectionModal';
import { GraphViewExtensions } from 'Extensions/GraphViewExtensions';
import { NameChanger } from 'Listeners/NameChanger';
import { ValidateWorldCommand } from 'Commands/ValidateWorldCommand';
import { NameInputModal } from 'Modals/NameInputModal';

export default class OnlyWorldsPlugin extends Plugin {
  graphViewExtensions: GraphViewExtensions;
    noteLinker: NoteLinker;
    nameChanger: NameChanger;

      onload(): void {
    
        this.registerHandlebarsHelpers(); 

        // doesnt work yet
      //  this.graphViewExtensions = new GraphViewExtensions(this.app, this);
      //   this.graphViewExtensions.initializeGraphView();
      // this.addStyles();
      // this.nameChanger = new NameChanger(this.app, this.manifest);
      // this.nameChanger.onload(); 
       this.nameChanger = new NameChanger(this.app, this.manifest); 
       this.nameChanger.setupNameChangeListener();
        this.noteLinker = new NoteLinker(this.app, this.manifest); 
        this.noteLinker.setupLinkerListeners();

        this.setupCommands();

        Handlebars.registerHelper('linkify', (ids:string) => {
          if (!ids) return '';
          // Log the input IDs to verify they're being received correctly.
          console.log(`Linkifying IDs: ${ids}`);
          return ids.split(',').map(id => `[[${id.trim()}]]`).join(', ');
      });


        console.log("OW Plugin loaded");
      }

      addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .graph-view.color-fill-character { color: blue; }
            .graph-view.color-fill-location { color: green; }
            .graph-view.color-fill-event { color: red; }
            .graph-view.color-fill-default { color: grey; }
            // Add more styles for other categories as needed
        `;
        document.head.appendChild(style);
    }

      registerHandlebarsHelpers() {
        if (typeof Handlebars === 'undefined') {
          console.error("Handlebars is not available.");
          return;
        }
        
        Handlebars.registerHelper('linkify', (ids: string, options: Handlebars.HelperOptions) => {
          if (!ids) return '';
          // Transform CSV IDs into linked markdown format
          return ids.split(',').map(id => `[[${id.trim()}]]`).join(', ');
        });
      }

      setupCommands() {
       
        const createCategoryFoldersCommand = new CreateCategoryFoldersCommand(this.app, this.manifest);
        const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);
        const retrieveWorldCommand = new ImportWorldCommand(this.app, this.manifest);
        const sendWorldCommand = new ExportWorldCommand(this.app, this.manifest);        
        const createWorldCommand = new CreateWorldCommand(this.app, this.manifest);
        const validateWorldCommand = new ValidateWorldCommand(this.app, this.manifest);

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
      

        this.addCommand({
          id: 'create-element',
          name: 'Create New OnlyWorlds Element',
          callback: () => {
              let templateModal = new TemplateSelectionModal(this.app, (category) => {
                  // Open the NameInputModal after selecting a category
                  let nameModal = new NameInputModal(this.app, category, (cat, name) => {
                      new CreateElementCommand(this.app, this.manifest).execute(cat, name);
                  });
                  nameModal.open();
              });
              templateModal.open();
          }
      });
  
      this.addCommand({
        id: 'validate-world',
        name: 'Validate World',
        callback: () => validateWorldCommand.execute(),
    });
    }

   
}
