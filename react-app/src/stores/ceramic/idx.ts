import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'

declare global {
  interface Window {
    idx?: IDX
  }
}

const aliases = {
  secretNotes: 'your definition docid goes here'
}

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  window.idx = idx
  return idx
}
