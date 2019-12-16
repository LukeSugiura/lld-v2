// @flow

import invariant from 'invariant'
import type { Command } from './ipcCommand'

import getAppAndVersion from './getAppAndVersion'
import firmwarePrepare from './firmwarePrepare'
import firmwareMain from './firmwareMain'
import firmwareRepair from './firmwareRepair'
import flushDevice from './flushDevice'
import getAddress from './getAddress'
import getDeviceInfo from './getDeviceInfo'
import getIsGenuine from './getIsGenuine'
import getLatestFirmwareForDevice from './getLatestFirmwareForDevice'
import installApp from './installApp'
import libcoreGetVersion from './libcoreGetVersion'
import libcoreReset from './libcoreReset'
import listApps from './listApps'
import ping from './ping'
import quitAndInstallElectronUpdate from './quitAndInstallElectronUpdate'
import testApdu from './testApdu'
import testCrash from './testCrash'
import testInterval from './testInterval'
import uninstallApp from './uninstallApp'
// FIXME
// import { commands as bridgeProxyCommands } from '../renderer/bridge/proxy'
import appOpExec from './appOpExec'

const all: Array<Command<any, any>> = [
  appOpExec,
  // ...bridgeProxyCommands,
  getAppAndVersion,
  firmwarePrepare,
  firmwareMain,
  firmwareRepair,
  flushDevice,
  getAddress,
  getDeviceInfo,
  getIsGenuine,
  getLatestFirmwareForDevice,
  installApp,
  libcoreGetVersion,
  libcoreReset,
  listApps,
  ping,
  quitAndInstallElectronUpdate,
  testApdu,
  testCrash,
  testInterval,
  uninstallApp,
]

export const commandsById = {}

all.forEach(cmd => {
  invariant(!all.some(c => c !== cmd && c.id === cmd.id), `duplicate command '${cmd.id}'`)
  commandsById[cmd.id] = cmd
})

export default all