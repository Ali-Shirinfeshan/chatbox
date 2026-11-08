/** Personal-only electron-builder overlay. Do not include in the upstream PR. */
const repository = process.env.PERSIAN_GITHUB_REPOSITORY || process.env.GITHUB_REPOSITORY
if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository) || repository.toLowerCase() === 'chatboxai/chatbox') {
  throw new Error(
    'Set PERSIAN_GITHUB_REPOSITORY=YOUR_USERNAME/YOUR_PUBLIC_FORK; refusing to use official Chatbox for personal updates.'
  )
}
const [owner, repo] = repository.split('/')
module.exports = {
  extends: './electron-builder.yml',
  productName: 'Chatbox Persian',
  appId: 'xyz.chatboxapp.persian',
  extraMetadata: { productName: 'Chatbox Persian' },
  publish: [{ provider: 'github', owner, repo, private: false }],
  detectUpdateChannel: false,
  extraResources: [
    { from: 'assets', to: 'assets', filter: ['**/*'] },
    { from: 'src/renderer/static/fonts/OFL-Vazirmatn.txt', to: 'licenses/Vazirmatn-OFL.txt' },
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    artifactName: 'Chatbox-Persian-${version}-Setup.${ext}',
    verifyUpdateCodeSignature: false,
    // No unsigned build should silently claim it has a Windows signature.
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    include: 'assets/installer.nsh',
  },
}
