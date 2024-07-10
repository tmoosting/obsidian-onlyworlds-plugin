import { Plugin } from 'obsidian';
import { Category } from 'enums'; // Adjust path as needed
import { CreateCategoryFoldersCommand } from './Commands/CreateCategoryFoldersCommand';
import { CreateTemplatesCommand } from './Commands/CreateTemplatesCommand';

export default class OnlyWorldsPlugin extends Plugin {
    onload(): void {
        console.log("OW Plugin loaded");

        const createCategoryFoldersCommand = new CreateCategoryFoldersCommand(this.app, this.manifest);
        const createTemplatesCommand = new CreateTemplatesCommand(this.app, this.manifest);

        // Register a command to create category folders
        this.addCommand({
            id: 'create-category-folders',
            name: 'Create Element Folders',
            callback: () => {
                createCategoryFoldersCommand.execute();
            }
        });

        // Register a command to setup templates
        this.addCommand({
            id: 'setup-templates',
            name: 'Create Element Templates',
            callback: () => createTemplatesCommand.execute(),
        });
    }
}
