const path = require('path');
const fs = require('fs');

console.log('Generating Prisma Client...');
console.log('Working directory:', __dirname);
console.log('Schema path:', path.join(__dirname, 'prisma', 'schema.prisma'));

// Set environment variables for the generator
process.env.PRISMA_SCHEMA_PATH = path.join(__dirname, 'prisma', 'schema.prisma');
process.env.PRISMA_GENERATE_DATAPACKAGE_DIR = path.join(__dirname, 'node_modules', '@prisma', 'client');
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Ensure the target directory exists
const targetDir = path.join(__dirname, 'node_modules', '@prisma', 'client', '.prisma');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Created directory:', targetDir);
}

// Try to use the @prisma/client generator directly
const generatorPath = path.join(__dirname, 'node_modules', '@prisma', 'client', 'generator-build', 'index.js');

try {
  console.log('Calling generator at:', generatorPath);
  console.log('Environment PRISMA_SCHEMA_PATH:', process.env.PRISMA_SCHEMA_PATH);
  console.log('Environment PRISMA_GENERATE_DATAPACKAGE_DIR:', process.env.PRISMA_GENERATE_DATAPACKAGE_DIR);

  const generator = require(generatorPath);

  console.log('✓ Generator loaded successfully');
  console.log('Generator type:', typeof generator);
  console.log('Generator keys:', Object.keys(generator || {}));

  // Check if .prisma/client was created
  const prismaClientDir = path.join(__dirname, 'node_modules', '@prisma', 'client', '.prisma', 'client');

  if (fs.existsSync(prismaClientDir)) {
    const files = fs.readdirSync(prismaClientDir);
    console.log('✓ Generated files in node_modules/@prisma/client/.prisma/client:', files.slice(0, 20));
  } else {
    console.log('⚠ Warning: .prisma/client directory not found at:', prismaClientDir);
    console.log('Checking what directories exist...');

    const prismaDir = path.join(__dirname, 'node_modules', '@prisma', 'client', '.prisma');
    if (fs.existsSync(prismaDir)) {
      console.log('✓ .prisma directory exists, contents:', fs.readdirSync(prismaDir));
    }
  }

  console.log('✓ Prisma Client generation completed!');
} catch (error) {
  console.error('✗ Failed to generate Prisma Client:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
