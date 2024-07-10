import { Plugin } from 'obsidian';
import { Category } from 'enums'; // Adjust path as needed
import { CreateCategoryFoldersCommand } from './Commands/CreateCategoryFoldersCommand';
import { SetupTemplatesCommand } from './Commands/SetupTemplatesCommand';

export default class OnlyWorldsPlugin extends Plugin {
    onload(): void {
        console.log("OW Plugin loaded");

        const createCategoryFoldersCommand = new CreateCategoryFoldersCommand(this.app,);
        const setupTemplatesCommand = new SetupTemplatesCommand(this.app, this.manifest);

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
            name: 'Setup Character Templates',
            callback: () => setupTemplatesCommand.execute(),
        });
    }
}
