const fs = require('fs');

const content = `export const APP_CONFIG = {
  apiBaseUrl: '${process.env.API_BASE_URL}'
};
`;

fs.writeFileSync(
  './src/app/core/config/app-config.ts',
  content
);

console.log('✓ app-config.ts generado');
console.log('API_BASE_URL =', process.env.API_BASE_URL);
