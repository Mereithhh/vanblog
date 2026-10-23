const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  PRIVATE_PASSWORD_REQUIRED_MESSAGE,
  hasPrivatePassword,
  privatePasswordError,
  privatePasswordFieldRules,
} = require('../../src/utils/privatePassword');

const repoRoot = path.join(__dirname, '../../../..');

function readSrc(relativePath) {
  return readFileSync(path.join(__dirname, '../../src', relativePath), 'utf8');
}

describe('admin private password requirement', () => {
  it('requires a non-empty password only when private is set', () => {
    assert.equal(privatePasswordError(true, ''), PRIVATE_PASSWORD_REQUIRED_MESSAGE);
    assert.equal(privatePasswordError(true, '   '), PRIVATE_PASSWORD_REQUIRED_MESSAGE);
    assert.equal(privatePasswordError(true, undefined), PRIVATE_PASSWORD_REQUIRED_MESSAGE);
    assert.equal(privatePasswordError('true', ''), PRIVATE_PASSWORD_REQUIRED_MESSAGE);
    assert.equal(privatePasswordError(false, ''), '');
    assert.equal(privatePasswordError(undefined, ''), '');
    assert.equal(privatePasswordError(true, 'pw'), '');
    assert.equal(hasPrivatePassword(' x '), true);
    assert.equal(hasPrivatePassword('   '), false);
  });

  it('field rules reject a blank password while private is on', async () => {
    const rules = privatePasswordFieldRules('private');
    const blocked = rules[0]({
      getFieldValue: (name) => (name === 'private' ? true : ''),
    });
    await assert.rejects(() => blocked.validator(null, '  '), /如若加密，请填写密码/);

    const open = rules[0]({ getFieldValue: () => false });
    await open.validator(null, '');

    const named = privatePasswordFieldRules('privateC');
    const createRule = named[0]({
      getFieldValue: (name) => name === 'privateC',
    });
    await assert.rejects(() => createRule.validator(null, ''), /如若加密/);
  });

  it('checks every admin form that can mark an article or category private', () => {
    const files = [
      'components/UpdateModal/index.tsx',
      'components/NewArticleModal/index.jsx',
      'components/ImportArticleModal/index.jsx',
      'components/PublishDraftModal/index.jsx',
      'pages/DataManage/tabs/Category.jsx',
    ];
    for (const file of files) {
      const src = readSrc(file);
      assert.match(src, /privatePasswordError/);
      assert.match(src, /privatePasswordFieldRules/);
    }
    assert.match(readSrc('components/NewArticleModal/index.jsx'), /privatePasswordError\(values\.privateC, values\.passwordC\)/);
    assert.match(readSrc('components/NewArticleModal/index.jsx'), /privatePasswordFieldRules\('privateC'\)/);
    assert.match(readSrc('components/PublishDraftModal/index.jsx'), /privatePasswordError\(values\.private, values\.pc\)/);
    assert.match(readSrc('components/UpdateModal/index.tsx'), /privatePasswordError\(values\.private, values\.password\)/);
  });

  it('documents that encryption requires a password and hidden posts share the URL gate', () => {
    const articleDocs = readFileSync(path.join(repoRoot, 'docs/features/article.md'), 'utf8');
    const hideDocs = readFileSync(path.join(repoRoot, 'docs/advanced/hide.md'), 'utf8');
    const tagDocs = readFileSync(path.join(repoRoot, 'docs/features/tag.md'), 'utf8');
    assert.match(articleDocs, /必须填写密码/);
    assert.match(hideDocs, /POST \/api\/public\/article\/:id/);
    assert.match(tagDocs, /分类已加密但密码为空/);
  });
});
