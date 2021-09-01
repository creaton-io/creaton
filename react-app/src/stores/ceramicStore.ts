import { DID } from 'dids'
import type { IDX } from '@ceramicstudio/idx'
import type { CeramicApi } from '@ceramicnetwork/common'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

import { hash } from '@stablelib/sha256'

import { fromString } from 'uint8arrays'

import { createCeramic } from './ceramic/ceramic'
import { createIDX } from './ceramic/idx'
import { getProvider } from './ceramic/wallet'

declare global {
  interface Window {
    did?: DID
    idx?: IDX
    ceramic?: CeramicApi
  }
}

interface SecretNotes {
  notes: Array<any>
}

export class CeramicStore {
  authProvider!: AuthProvider

  async authenticate(): Promise<string> {
    const [ceramic, provider] = await Promise.all([createCeramic(), getProvider()])
    const did = new DID({
      provider,
      resolver: { ...KeyDidResolver.getResolver(), ...ThreeIdResolver.getResolver(ceramic) },
    })
    await did.authenticate()
    window.did = did
    ceramic.did = did
    const idx = createIDX(ceramic)
    console.log('did', did)
    return idx.id
  }

  async ethAddressToDID (address: string): Promise<string> {
    const caip10Doc = await window.ceramic?.createDocument('caip10-link', {
      metadata: {
        family: 'caip10-link',
        controllers: [address.toLowerCase() + '@eip155:1'],
      },
    })
    return caip10Doc?.content
  }

  async updateProfile(name: string, description: string) {
    await window.idx?.set('basicProfile', { name, description })
  }

  async createNote() {
    const record = ((await window.idx?.get('secretNotes')) as SecretNotes) || { notes: [] }
    const recipient = (document.getElementById('recipient') as HTMLInputElement).value
    const note = (document.getElementById('note') as HTMLInputElement).value
    const noteData = { recipient, note }
    const recipients = [window.did?.id as string] // always make ourselves a recipient
    if (recipient) recipients.push(recipient)
    const encryptedNote = await window.did?.createDagJWE(noteData, recipients)
    record.notes.push(encryptedNote)
    await window.idx?.set('secretNotes', record)
  }

  async _authCreate(): Promise<Uint8Array> {
    const message = 'Allow this account to control your identity'
    const authSecret = await this.authProvider.authenticate(message)
    const entropy = hash(fromString(authSecret.slice(2)))
    return entropy
  }

  /*
  async loadNotes() {
    const noteContainer = document.getElementById('allNotes')
    // @ts-ignore
    noteContainer?.innerHTML = ''
    let user = (document.getElementById('user') as HTMLInputElement).value || window.did?.id
    if (user && !user.startsWith('did')) {
      user = await this.ethAddressToDID(user)
    }
    const record = (await window.idx?.get('secretNotes', user)) as SecretNotes

    record?.notes.map(async (encryptedNote, mapindex) => {
      try {
        const { recipient, note } = (await window.did?.decryptDagJWE(encryptedNote)) as Record<
          string,
          any
        >
        let noteEntry = '<p>'
        if (recipient) {
          noteEntry +=
            '<b>Recipient:</b> ' + (recipient || '--') + `<span id="name${mapindex}"></span>`
          this.addNameToNote(recipient, 'name' + mapindex)
        }
        noteEntry += '<br /><b>Note:</b> ' + note + '</p><hr />'
        // @ts-ignore
        noteContainer?.innerHTML += noteEntry
      } catch (e) {}
    })
  }

  async addNameToNote(recipient: string, elemId: string): Promise<void> {
    const { name } = ((await window.idx?.get('basicProfile', recipient)) as any) || {}
    if (name) {
      const nameContainer = document.getElementById(elemId)
      // @ts-ignore
      nameContainer?.innerHTML = `<br /><b>Recipient name:</b> ${name}`
    }
  }

  }

  document.getElementById('bauth')?.addEventListener('click', () => {
    // @ts-ignore
    document.getElementById('authloading')?.style?.display = 'block'

    this.authenticate().then(
      (id) => {
        console.log('Connected with DID:', id)
        // @ts-ignore
        document.getElementById('authloading')?.style.display = 'none'
        // @ts-ignore
        document.getElementById('main')?.style.display = 'block'
        ;(document.getElementById('bauth') as HTMLInputElement).disabled = true
      },
      (err) => {
        console.error('Failed to authenticate:', err)
        // @ts-ignore
        document.getElementById('authloading')?.style.display = 'none'
      }
    )
  })

  document.getElementById('updateProfile')?.addEventListener('click', async () => {
    // @ts-ignore
    document.getElementById('profileloading')?.style?.display = 'block'
    await updateProfile()
    // @ts-ignore
    document.getElementById('profileloading')?.style?.display = 'none'
  })

  document.getElementById('loadNotes')?.addEventListener('click', async () => {
    // @ts-ignore
    document.getElementById('loadloading')?.style?.display = 'block'
    await loadNotes()
    // @ts-ignore
    document.getElementById('loadloading')?.style?.display = 'none'
  })

  document.getElementById('createNote')?.addEventListener('click', async () => {
    // @ts-ignore
    document.getElementById('createloading')?.style?.display = 'block'
    await createNote()
    // @ts-ignore
    document.getElementById('createloading')?.style?.display = 'none'
  })
  */
}
