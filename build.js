require('esbuild')
  .build({
    entryPoints: ['src/main.ts'],
    external: ['ofx'],
    bundle: true,
    target: 'node14',
    platform: 'node',
    outfile: 'dist/ofix.js',
    plugins: [],
  })
  .then(() => console.log('Finished successfully.'))
  .catch((error) => {
    console.log(`Finished erroneously. Error encountered: ${error.message}`);
    process.exit(1);
  });
