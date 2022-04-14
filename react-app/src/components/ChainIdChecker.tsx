import {Button} from '../elements/button';
import {useWeb3React} from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

const ChainIdChecker = (props) => {
  const web3React = useWeb3React();
  const library = web3React.provider as Web3Provider;
  const chainId = web3React.chainId;

  if (!library || chainId === 80001 || chainId === 137) return null;
  return (
    <div className="w-full fixed h-full z-30 flex items-center">
      <div className="border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-lg bg-gray-100">
        <p className="my-3">
          Creaton beta uses the Polygon Matic network.
          <br />
          Please switch to this network
        </p>
        <Button
          label="Switch to the Polygon Matic network"
          onClick={() => {
            library.send('wallet_addEthereumChain',
              [
                {
                  chainId: '0x89',
                  chainName: 'Polygon Matic',
                  rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/'],
                },
              ],
            );
          }}
        />
      </div>
    </div>
  );
};

export default ChainIdChecker;
