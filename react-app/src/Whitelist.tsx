import {useWeb3React} from "@web3-react/core";

const whitelist = [];

export function useCanBecomeCreator() {
  const {account} = useWeb3React()
  if (!account) return true;
  return true
}

export function useIsAdmin() {
  const {account} = useWeb3React()
  if (!account) return false;
  return '0x640d1fd422649b4e855a12a6fbf762fc56935793' === account.toLowerCase()
}
