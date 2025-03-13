const insertLog = () => {
  const fs = require('fs');
  const log = fs.readFileSync('CHANGELOG.md', { encoding: 'utf-8' });
  const newLog =
    `\
---
title: 更新日志
icon: clock
order: 8
redirectFrom: /ref/changelog.html
---
` + log.replace('# Changelog', '');

  fs.writeFileSync('docs/changelog.md', newLog, { encoding: 'utf-8' });

  let version = fs.readFileSync('doc-version', { encoding: 'utf-8' });
  version = version.split('\n')[0].trim();
  const arr = version.split('.');
  const sub = arr.pop();
  arr.push(String(parseInt(sub) + 1));
  const newVersion = arr.join('.');
  fs.writeFileSync('doc-version', newVersion, { encoding: 'utf-8' });

  // Use spawnSync for safer command execution
  const { spawnSync } = require('child_process');
  
  try {
    // Execute git commands separately for better security and error handling
    spawnSync('git', ['add', '.'], { stdio: 'inherit' });
    spawnSync('git', ['commit', '-m', 'docs: 更新文档'], { stdio: 'inherit' });
    spawnSync('git', ['tag', `doc-${newVersion}`], { stdio: 'inherit' });
    spawnSync('git', ['push', '--follow-tags', 'origin', 'master'], { stdio: 'inherit' });
    spawnSync('git', ['push', '--tags'], { stdio: 'inherit' });
    
    console.log(`✅ 成功发布文档 v${newVersion}`);
  } catch (err) {
    console.log('❌ 发布文档失败:', err);
    process.exit(1);
  }
};
insertLog();
