import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const updater = {
    on: vi.fn(),
    checkForUpdates: vi.fn(),
    setFeedURL: vi.fn(),
    quitAndInstall: vi.fn(),
    logger: null as unknown,
    autoDownload: false,
    autoInstallOnAppQuit: false,
    allowPrerelease: false,
    allowDowngrade: false,
    channel: '' as string,
  }
  return { updater }
})
vi.mock('electron', () => ({ ipcMain: { removeHandler: vi.fn(), handle: vi.fn() } }))
vi.mock('electron-updater', () => ({ autoUpdater: mocks.updater }))
vi.mock('./installer-command', () => ({ getQuitAndInstallArguments: () => [false, true] }))
vi.mock('./store-node', () => ({ getSettings: () => ({ autoUpdate: false, betaUpdate: false }) }))
vi.mock('./util', () => ({ getLogger: () => ({ transports: { file: {} }, error: vi.fn(), info: vi.fn() }) }))

import { AppUpdater } from './app-updater'

describe('personal vs official update feed', () => {
  beforeEach(() => {
    mocks.updater.checkForUpdates.mockReset().mockResolvedValue({ updateInfo: { version: '1.24.2-persian.2' } })
    mocks.updater.setFeedURL.mockReset()
  })
  afterEach(() => {
    delete process.env.CHATBOX_PERSIAN_BUILD
  })

  it('never uses official feeds in a personal build', async () => {
    process.env.CHATBOX_PERSIAN_BUILD = '1'
    const appUpdater = new AppUpdater(() => null)
    await appUpdater.tryUpdate()
    expect(mocks.updater.checkForUpdates).toHaveBeenCalledTimes(1)
    expect(mocks.updater.setFeedURL).not.toHaveBeenCalled()
    expect(mocks.updater.channel).toBe('latest')
    expect(mocks.updater.allowDowngrade).toBe(false)
    expect(mocks.updater.allowPrerelease).toBe(true)
  })

  it('does not fall back to official update URLs if personal GitHub fails', async () => {
    process.env.CHATBOX_PERSIAN_BUILD = '1'
    mocks.updater.checkForUpdates.mockRejectedValueOnce(new Error('personal repo unavailable'))
    const appUpdater = new AppUpdater(() => null)
    await expect(appUpdater.tryUpdate()).rejects.toThrow('personal repo unavailable')
    expect(mocks.updater.setFeedURL).not.toHaveBeenCalled()
  })

  it('keeps the original official feed strategy in a normal build', async () => {
    process.env.CHATBOX_PERSIAN_BUILD = '0'
    const appUpdater = new AppUpdater(() => null)
    await appUpdater.tryUpdate()
    expect(mocks.updater.setFeedURL).toHaveBeenCalledWith('https://chatboxai.app/api/auto_upgrade')
  })
})
