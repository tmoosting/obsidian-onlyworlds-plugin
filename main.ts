import { Plugin } from 'obsidian';
import { Category } from 'enums'; // Adjust path as needed
import { CreateCategoryFoldersCommand } from './Commands/CreateCategoryFoldersCommand';
import { CreateTemplatesCommand } from './Commands/CreateTemplatesCommand';
import { RetrieveWorldCommand } from './Commands/RetrieveWorldCommand';
import { SendWorldCommand } from 'Commands/SendWorldCommand';

export default class OnlyWorldsPlugin extends Plugin {
    onload(): void {
        console.log("OW Plugin loaded");

        const createCategoryFoldersCommand = new CreateCategoryFoldersCommand(this.app, this.manifest);
        const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);
        const retrieveWorldCommand = new RetrieveWorldCommand(this.app, this.manifest);
        const sendWorldCommand = new SendWorldCommand(this.app, this.manifest);

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
            id: 'fetch-world',
            name: 'Retrieve World Data',
            callback: () => retrieveWorldCommand.execute(),
        });

             // Register a command to convert nodes and send as world data
        this.addCommand({
            id: 'send-world',
            name: 'Send World Data',
            callback: () => sendWorldCommand.execute(),
        });

    }
}
