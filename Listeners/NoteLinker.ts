import { App, Plugin, MarkdownView, Editor, Notice, WorkspaceLeaf, EditorPosition, normalizePath, TFolder } from 'obsidian';
import { ElementSelectionModal } from '../Modals/ElementSelectionModal';

export class NoteLinker extends Plugin {
    private currentEditor: Editor | null = null;

    setupLinkerListeners() {
        this.addCommand({  // Using `this.addCommand` here
            id: 'link-to-element',
            name: 'Link an element',
            hotkeys: [{
                modifiers: ["Mod", "Shift"],
                key: 'l'
            }],
            checkCallback: (checking: boolean) => {
                const editor = this.currentEditor;
                if (editor) {
                    const cursor = editor.getCursor();
                    const lineText = editor.getLine(cursor.line);
                    if (this.isLineLinkField(lineText)) {
                        if (checking) return true;
                        this.linkElement(editor, cursor, lineText);
                    }
                }
                return false;
            }
        });

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', leaf => this.handleLeafChange(leaf))
        );
    }

    handleLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf && leaf.view instanceof MarkdownView) {
            this.currentEditor = leaf.view.editor;
        } else {
            this.currentEditor = null;
        }
    }

    private isLineLinkField(line: string): boolean {
        return /<span class="(link-field|multi-link-field)"[^>]*>/.test(line);
    }

    private async linkElement(editor: Editor, cursor: EditorPosition, lineText: string) {
        const currentFile = this.app.workspace.getActiveFile();
        if (currentFile) {
            const currentContent = await this.app.vault.read(currentFile);
            const { id: currentId } = this.parseElement(currentContent);
            
            const worldName = this.extractWorldName(currentFile.path);
            
            const match = /data-tooltip="(Single|Multi) (.*?)">/.exec(lineText);
            if (match) {
                const elementType = match[2];
                const fieldName = match[2]; // Assume this captures the field name correctly
                const elements = await this.fetchElements(elementType, currentId);
                
                new ElementSelectionModal(this.app, elements, elementType, fieldName, (selectedElements) => {
                    this.handleElementSelection(editor, cursor, lineText, selectedElements);
                }).open();
            }
        }
    }
    
    
    private async fetchElements(elementType: string, currentId: string): Promise<{ name: string; id: string }[]> {
        const topWorldName = await this.determineTopWorldFolder();
        const elementsPath = `OnlyWorlds/Worlds/${topWorldName}/Elements/${elementType}`;
        console.log(`Looking for elements in: ${elementsPath}`); // Confirm the path
    
        const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(elementsPath));
        console.log(`Total files found in the path: ${files.length}`); // Log the number of files found
    
        const elements = [];
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const { name, id } = this.parseElement(content);
            console.log(`Checking file: ${file.path}, Found ID: ${id}, Name: ${name}`); // Detailed log for each file
    
            if (id !== currentId) {
                elements.push({ name, id });
                console.log(`Added element: ${name} with ID: ${id}`); // Log each element added
            }
        }
    
        console.log(`Total elements added: ${elements.length}`); // Final count of elements added
        return elements;
    }
    
    
    private async determineTopWorldFolder(): Promise<string> {
        const worldsPath = normalizePath('OnlyWorlds/Worlds');
        const worldsFolder = this.app.vault.getAbstractFileByPath(worldsPath);
        if (worldsFolder instanceof TFolder) {
            const subFolders = worldsFolder.children.filter(child => child instanceof TFolder);
            return subFolders.length > 0 ? subFolders[0].name : 'DefaultWorld';
        }
        return 'DefaultWorld';  // Fallback if no subfolder is present
    }
    

    private extractWorldName(filePath: string): string {
        // Assumes the path format is 'OnlyWorlds/Worlds/{WorldName}/...'
        const pathParts = filePath.split('/');
        const worldIndex = pathParts.indexOf('Worlds');
        if (worldIndex !== -1 && pathParts.length > worldIndex + 1) {
            return pathParts[worldIndex + 1];
        }
        return "Unknown World";  // Default if the world name cannot be determined
    }
   

  private parseElement(content: string): { name: string, id: string } {
    console.log("Parsing element content...");
    // Adjust the regex to capture the full ID including dashes and potential special characters
    const idMatch = content.match(/<span class="text-field" data-tooltip="Text">ID<\/span>:\s*([\w-]+)/);
    const nameMatch = content.match(/<span class="text-field" data-tooltip="Text">Name<\/span>:\s*(.+)/);

    const id = idMatch ? idMatch[1].trim() : "Unknown ID";
    const name = nameMatch ? nameMatch[1].trim() : "Unnamed Element";

    console.log(`Parsed ID: ${id}`);
    console.log(`Parsed Name: ${name}`);

    return { id, name };
}


    private handleElementSelection(editor: Editor, cursor: EditorPosition, lineText: string, selectedElements: { name: string; id: string }[]) {
        // Get the current content of the line
        let lineContent = editor.getLine(cursor.line);
        console.log(`Original Line Content: ${lineContent}`);
    
        // Find the position to insert the new IDs
        const insertionPoint = lineContent.indexOf('</span>:') + '</span>:'.length;
    
        // Extract the current values if any
        let currentValues = lineContent.substring(insertionPoint).trim();
        console.log(`Current Values Before Cleanup: ${currentValues}`);
    
        // Remove any trailing unwanted characters (like the unwanted dash and newlines)
        currentValues = currentValues.replace(/[\r\n-]+/g, '').trim();
        console.log(`Current Values After Cleanup: ${currentValues}`);
    
        // Append the new names to the current values
        const newEntries = selectedElements.map(el => `[[${el.name}]]`).join(',');
        const updatedValues = currentValues ? `${currentValues},${newEntries}` : newEntries;
        console.log(`Updated Values: ${updatedValues}`);
    
        // Update the line content
        const updatedLineContent = lineContent.substring(0, insertionPoint) + ' ' + updatedValues;
        console.log(`Updated Line Content: ${updatedLineContent}`);
    
        // Replace the line with the updated content
        editor.setLine(cursor.line, updatedLineContent);
    }
    
    
    
    
    
}
