const fs = require('fs');
const path = require('path');

// Directory paths
const markdownDir = './';
const assetsDir = './.gitbook/assets';

// Function to get all markdown files
function getMarkdownFiles(dir) {
    return fs.readdirSync(dir).filter(file => file.endsWith('.md'));
}

// Function to extract asset references from markdown files
function extractAssetReferences(markdownFiles) {
    const assetReferences = new Set();
    const assetRegex = /!\[.*?\]\((.*?)\)/g; // Matches image references

    markdownFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = assetRegex.exec(content)) !== null) {
            const assetPath = match[1].startsWith('.gitbook/assets/') ? match[1] : `.gitbook/assets/${match[1]}`;
            assetReferences.add(path.normalize(assetPath)); // Normalize and capture the asset path
            console.log(`Found asset reference: ${assetPath}`); // Log found asset references
        }
    });

    return assetReferences;
}

// Function to list all assets in the assets directory
function listAssets() {
    return fs.readdirSync(assetsDir);
}

// Function to delete unreferenced assets
function deleteUnreferencedAssets(assetReferences) {
    const assets = listAssets();

    assets.forEach(asset => {
        const assetPath = path.resolve(path.join(assetsDir, asset));
        const normalizedAssetPath = path.resolve(path.normalize(assetPath));
        const hasReference = Array.from(assetReferences).some(ref => path.resolve(ref) === normalizedAssetPath);
        if (!hasReference) {
            fs.unlinkSync(assetPath);
            console.log(`Deleted unreferenced asset: ${asset}`);
        }
    });
}

// Main function
function main() {
    const markdownFiles = getMarkdownFiles(markdownDir);
    const assetReferences = extractAssetReferences(markdownFiles);
    
    const totalAssets = listAssets();

    console.log(`Total assets in directory: ${totalAssets.length}`);
    console.log(`Referenced assets from markdown files: ${Array.from(assetReferences)}`);

    // Proceed with deletion
    deleteUnreferencedAssets(assetReferences);
}

main();
