const fs = require('fs-extra');
const path = require('path');
const deepmerge = require('deepmerge');

const languagesDir = path.join(__dirname, 'src','assets', 'i18n','in');
const outputDir = path.join(__dirname, 'src', 'assets', 'i18n', 'merged');
const languages = fs.readdirSync(languagesDir).filter(name => {
  return fs.statSync(path.join(languagesDir, name)).isDirectory();
});

languages.forEach(lang => {
  const langDir = path.join(languagesDir, lang);
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

  let merged = {};

  files.forEach(file => {
    const filePath = path.join(langDir, file);
    const json = fs.readJsonSync(filePath);
    merged = deepmerge(merged, json);
  });

  const outputFilePath = path.join(outputDir, `${lang}.json`);
  fs.outputJsonSync(outputFilePath, merged, { spaces: 2 });

  console.log(`✔ Merged translations for '${lang}' into: ${outputFilePath}`);
});
