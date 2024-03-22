const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');
const fs = require('fs');

const clientFilePath = 'dist/client/dist.client.js';
const serverFilePath = 'dist/server/dist.server.js';

const config = (entryPoint, outputFile) => ({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: outputFile,
    plugins: [
        esbuildPluginTsc({
            force: true,
        }),
    ],
    minifyWhitespace: true,
    minifyIdentifiers: false, // Minifying identifiers is disabled because of issues with the NUI callback listener
    minifySyntax: true,
});

async function bundle() {
    await esbuild.build(config('src/client/client.ts', clientFilePath));
    await esbuild.build(config('src/server/server.ts', serverFilePath));
}

const clientPlugins = [
    {
        name: 'client-watch-plugin',
        setup(build) {
            let buildIndex = 0;
            build.onEnd(() => {
                cleanup(
                    clientFilePath,
                    buildIndex == 0
                        ? '[Armoury:] Client file watch mode begins..'
                        : '[Armoury:] Modifications detected. Recompiling resource..'
                );
                buildIndex++;
            });
        },
    },
];

const serverPlugins = [
    {
        name: 'server-watch-plugin',
        setup(build) {
            let buildIndex = 0;
            build.onEnd(() => {
                cleanup(
                    serverFilePath,
                    buildIndex == 0
                        ? '[Armoury:] Server file watch mode begins..'
                        : '[Armoury:] Modifications detected. Recompiling resource..'
                );
                buildIndex++;
            });
        },
    },
];

async function watch() {
    await (
        await esbuild.context({
            ...config('src/client/client.ts', clientFilePath),
            plugins: clientPlugins,
        })
    ).watch();
    await (
        await esbuild.context({
            ...config('src/server/server.ts', serverFilePath),
            plugins: serverPlugins,
        })
    ).watch();
    console.log('Starting development in watch mode..');
}

function cleanup(filePath, message = 'Occurrences removed from file: ' + filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Remove occurrences of "Cfx.Client." and "Cfx."
        const modifiedContent = data
            .replace(/Cfx\.Client\./g, '')
            .replace(/Cfx\.Server\./g, '')
            .replace(/Cfx\./g, '');

        // Write the modified content back to the file
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log(message);
        });
    });
}

if (process.argv.includes('--watch')) {
    watch();
} else {
    bundle()
        .catch((error) => {
            console.log(error);
            process.exit(1);
        })
        .then(() => cleanup(clientFilePath))
        .then(() => cleanup(serverFilePath));
}
