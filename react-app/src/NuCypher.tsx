import {Socket} from "socket.io-client";
import {TransactionRequest} from "@ethersproject/providers";
import {arrayify} from "ethers/lib/utils";
import {Signer} from "ethers";


export class NuCypher {
  socket
  timeout

  constructor(socket: Socket, timeout: number = 60000) {
    this.socket = socket
    this.timeout = timeout
  }

  public async encrypt(file_content: string, label: string, address: string) {
    let event_name = 'encrypt_result'
    const nucypher = this
    return new Promise<Object>(async function (resolve, reject) {
      let listener = (data) => {
        console.log(event_name, data);
        resolve(data)
      };
      nucypher.socket.on(event_name, listener)
      nucypher.socket.emit('encrypt', {address, file_content, label})
      await new Promise(r => setTimeout(r, nucypher.timeout));
      nucypher.socket.off(event_name, listener)
      reject('Encryption timed out. Took more than ' + (nucypher.timeout/1000) + ' seconds')
    })
  }

  public async grant(label: string, address: string, pubkey_enc: string, pubkey_sig: string,
                     signer: Signer) {
    const nucypher = this
    return new Promise<Object>(async function (resolve, reject) {
      let transaction_listener = (transaction_dict) => {
        console.log('sign_transaction', transaction_dict);
        transaction_dict['gasLimit'] = transaction_dict['gas']
        const _id: string = transaction_dict['_id']
        delete transaction_dict['_id']
        delete transaction_dict['gas']
        const transaction: TransactionRequest = transaction_dict;
        signer.sendTransaction(transaction).then(function (response) {
          console.log('it was successfuly', response)
          nucypher.socket.emit('sign_response', {
            txHash: response.hash,
            response: response,
            _id: _id,
            status: 'success'
          })
        })
          .catch(function (error) {
            console.log('some error happened', error.message)
            nucypher.socket.emit('sign_response', {error: error.message, _id: _id, status: 'error'})
          })
      };
      let message_listener = async (message_dict) => {
        console.log('sign_message', message_dict)
        const _id: string = message_dict['_id']
        delete message_dict['_id']
        const message = arrayify(message_dict['message'])
        signer.signMessage(message)
          .then(function (response) {
            console.log('sign response', response)
            nucypher.socket.emit('sign_response', {signature: response, _id: _id, status: 'success'})
          }).catch(function (error) {
          console.log('sign error', error)
          nucypher.socket.emit('sign_response', {error: error.message, _id: _id, status: 'error'})
        })
      };
      let grant_listener = (data) => {
        console.log('grant_response', data)
        resolve(data)
      };
      nucypher.socket.on('sign_transaction', transaction_listener)
      nucypher.socket.on('sign_message', message_listener)
      nucypher.socket.on('grant_response', grant_listener)
      nucypher.socket.emit('grant', {label, address, pubkey_enc, pubkey_sig})
      await new Promise(r => setTimeout(r, nucypher.timeout));
      nucypher.socket.off('sign_transaction', transaction_listener)
      await new Promise(r => setTimeout(r, nucypher.timeout));
      nucypher.socket.off('sign_message', message_listener)
      nucypher.socket.off('grant_response', grant_listener)
      reject('timeout')
    })
  }

  public async getKeyPair(address: string) {
    let event_name = 'key_pair'
    const nucypher = this
    return new Promise<Object>(async function (resolve, reject) {
      let listener = (data) => {
        console.log(event_name, data);
        resolve(data)
      };
      nucypher.socket.on(event_name, listener)
      nucypher.socket.emit('get_key_pair', {address: address})
      await new Promise(r => setTimeout(r, nucypher.timeout));
      nucypher.socket.off(event_name, listener)
      reject('timeout')
    })
  }

  public async decrypt(policy_pubkey: string, alice_sig_pubkey: string, content: string, label: string, address: string) {
    const data: { [key: string]: string } = {
      enc_file_content: content, label: label, policy_pubkey: policy_pubkey,
      creator_pubkey: alice_sig_pubkey, address: address
    };

    let event_name = 'decrypt_result'
    const nucypher = this
    return new Promise<Object>(async function (resolve, reject) {
      let listener = async (data) => {
        console.log(event_name, data);
        resolve(data)
      };
      nucypher.socket.on(event_name, listener)
      nucypher.socket.emit('decrypt', data)
      await new Promise(r => setTimeout(r, nucypher.timeout));
      nucypher.socket.off(event_name, listener);
      reject('timeout')
    })
  }
}
