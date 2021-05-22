import {useWeb3React} from "@web3-react/core";

const whitelist = [
  '0x640d1fd422649b4e855a12a6fbf762fc56935793',
  '0x530922b450b77e365c4249a65c784ccfe770dd6a',
  '0x2944d48241a36d52623e98812c8bc5aed8e8d6a0',
  '0x6270000e0d857a1aeae418bad12b14d022225475',
  '0xc3b784759ea2840f7769d2825b3082c5ac0b8ed9',
  '0xe0fff1e12c06e04eba836a653487d42b2b336741',
  '0xdae7446a82d09e396a13e08849b3a204b561e5d2',
  '0x8eb97c7dbc3916b1c19768f02da61555f44d51be',
  '0x0f8540760e4c0dd1ae9a094a5602e8b8ac9b0cd3'
]

export function useCanBecomeCreator() {
  const {account} = useWeb3React()
  if (!account) return false;
  return whitelist.includes(account.toLowerCase())
}

export function useIsAdmin() {
  const {account} = useWeb3React()
  if (!account) return false;
  return '0x640d1fd422649b4e855a12a6fbf762fc56935793' === account.toLowerCase()
}
