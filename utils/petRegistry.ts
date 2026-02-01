
// This file automatically discovers all assets in the src/assets/avatars folder
// and categories them into 3D models or 2D sprites.

const modules = import.meta.glob('../src/assets/avatars/*.*', { eager: true, query: '?url', import: 'default' });

export type PetType = 'glb' | 'fbx' | 'image';

export interface PetDefinition {
    id: string;
    name: string;
    type: PetType;
    src: string;
}

export const getAvailablePets = (): PetDefinition[] => {
    const pets: PetDefinition[] = [];

    for (const path in modules) {
        const src = modules[path] as string;

        // Extract filename from path (e.g., /assets/avatars/panda.glb -> panda.glb)
        // Adjust regex to capture filename from path string key like "../assets/avatars/panda.glb"
        const match = path.match(/([^\/]+)\.(glb|fbx|png|jpg|jpeg|gif)$/i);

        if (match) {
            const filename = match[0];
            const nameWithoutExt = match[1];
            const ext = match[2].toLowerCase();

            let type: PetType = 'image';
            if (ext === 'glb') type = 'glb';
            else if (ext === 'fbx') type = 'fbx';
            // gif files are treated as images (type = 'image')

            // Clean up name (replace underscores/dashes with spaces for display if needed)
            // But ID should be consistent.
            const displayName = nameWithoutExt
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

            pets.push({
                id: filename, // unique ID based on full filename
                name: displayName,
                type,
                src
            });
        }
    }

    // Sort: 3D models first, then images
    return pets.sort((a, b) => {
        if (a.type !== 'image' && b.type === 'image') return -1;
        if (a.type === 'image' && b.type !== 'image') return 1;
        return a.name.localeCompare(b.name);
    });
};
