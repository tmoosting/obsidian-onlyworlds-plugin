# OnlyWorlds Plugin for Obsidian

Welcome to **OnlyWorlds**, a comprehensive plugin designed to seamlessly integrate the worldbuilding capabilities of the **OnlyWorlds framework** into your Obsidian vault. This tool enables you to convert, create, export, and import richly detailed worlds right within your personal knowledge base.

## OnlyWorlds Framework
A robust, cross-platform solution for world creators, enabling the design, sharing, and simulation of immersive worlds. Discover more about the framework and access technical resources through the following links:
- General Information: [OnlyWorlds Website](https://www.onlyworlds.com)
- Technical Documentation: [OnlyWorlds Tech Docs](https://onlyworlds.github.io)

With this plugin, users can start from scratch or import existing worlds to adapt, expand, and enrich their storytelling or game design processes.

## Core Files and Folders
By utilizing **OnlyWorlds**, the following structure is automatically established within your vault through commands like **Create World** or **Import World**:
- **OnlyWorlds**: A top-level parent folder.
- **Worlds**: A subdirectory containing individual folders for each world you manage.
  - Each world folder includes a `World.md` file and an **Elements** folder.
- **Elements**: Divided into 18 subfolders, each representing a category like Character, Location, etc.
- **Templates**: Contains pre-defined templates for each of the 18 element categories. These templates facilitate element creation and should remain unedited.
- **Settings**: A configuration file allowing user-specific adjustments.

## Getting Started
To kickstart your worldbuilding journey within Obsidian:
1. Press `Ctrl+P` and execute the **Create World** command to set up all necessary files automatically.
2. Use the **Create Element** command to begin adding elements like a Character or a Location.
3. If you’re transitioning from another platform, use the **Import World** command to bring your existing OnlyWorlds into Obsidian.

### Navigating and Linking Elements
- Navigate to `OnlyWorlds/Worlds/NewWorld/Elements/Character`.
- To link a Character’s birthplace, navigate to the Birthplace field, click behind it, and press `Ctrl/Cmd + Shift + L`, then select the location.

## Element Editing
### Linkable Fields
- Fields with **blue dotted lines** are linkable and can contain multiple links.
- Fields with **light blue dotted lines** are restricted to a single link.

### Field Types
- **Italic fields**: Numeric only. Hover over the field name to view any maximum value constraints.
- **Other fields**: Accept text of any length.

### Editing Guidelines
- The **Name** field of an element must match the note name.
- Each element must have a unique Id, generated automatically. Use the **Create Element** command to ensure uniqueness. If duplicating manually, ensure to generate a new UUIDv7.

## Commands
- **Create README/Templates/Settings**: Automatically executed during world creation/import. Manual execution is unnecessary unless restoration is needed.
- **Create World**: Initializes a new world along with all required files and folders.
- **Import World**: Imports a world using a specific world key from the OnlyWorlds server. To overwrite existing worlds, delete the old folder first.
- **Export World**: Saves your world under a specified world key to the OnlyWorlds server.
- **Validate World**: Ensures all world data and elements are correctly formatted. This command must pass without errors before exporting and can be run manually for checks.

## Settings
Adjust plugin settings to tailor the OnlyWorlds experience:
- Select the **active world** for ongoing work.
- Enable quick commands for creating elements from each of the 18 categories, streamlining the element creation process.

## Contact and Contribution
We welcome contributions and feedback on the OnlyWorlds plugin. Please visit our [documentation](https://onlyworlds.github.io) and [website](https://www.onlyworlds.com) for more information and to get involved in the development.

For assistance and further engagement with the community, refer to the links provided in the introduction.
