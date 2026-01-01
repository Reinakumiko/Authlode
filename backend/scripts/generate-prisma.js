const path = require('path');
const fs = require('fs');

async function generatePrismaClient() {
  console.log('Generating Prisma Client manually...');

  // Import Prisma's generator helper
  const { Generator } = require('@prisma/generator-helper');

  // Get the schema path
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const outputDir = path.join(__dirname, '..', 'node_modules', '.prisma');

  console.log('Schema path:', schemaPath);
  console.log('Output directory:', outputDir);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Read the schema
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('Schema loaded successfully');

    // Create generator instance
    const generator = new Generator({
      schemaPath,
      outputDir,
    });

    console.log('Generator created, generating client...');

    // Generate the client
    await generator.generate();

    console.log('✓ Prisma Client generated successfully!');

    // Check what files were created
    const clientDir = path.join(outputDir, 'client');
    if (fs.existsSync(clientDir)) {
      const files = fs.readdirSync(clientDir);
      console.log('Generated files:', files);
    }

  } catch (error) {
    console.error('✗ Failed to generate Prisma Client:', error.message);
    console.error('Stack:', error.stack);

    // Try alternative approach: use the built-in generation
    console.log('\nTrying alternative approach...');

    try {
      // Try to import and use the generator directly
      const { generate } = require('@prisma/client/dist/generator-build/index.js');
      console.log('Generator module loaded');

      const options = {
        schema: schemaPath,
        output: outputDir,
      };

      await generate(options);
      console.log('✓ Alternative generation succeeded!');
    } catch (error2) {
      console.error('✗ Alternative approach also failed:', error2.message);
      process.exit(1);
    }
  }
}

generatePrismaClient()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
