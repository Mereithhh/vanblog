const fs = require('fs');
const run = () => {
  const changelog = fs.readFileSync('CHANGELOG.md', { encoding: 'utf-8' });
  const c = changelog.split('## [').slice(0, 2).join('## [').replace('# Changelog', '');

  fs.writeFileSync('CHANGE.md', c.substring(0, c.length - 1), {
    encoding: 'utf-8',
  });
};
run();
