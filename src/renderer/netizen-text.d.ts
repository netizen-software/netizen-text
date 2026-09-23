import type { NetizenTextApi } from '../shared/ipc-contract'

declare global {
  interface Window {
    netizenText: NetizenTextApi
  }
}

export {}
