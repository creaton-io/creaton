import {network, getUnnamedAccounts, ethers, getChainId} from 'hardhat';

const mockCreators = [
  ['https://briano88.files.wordpress.com/2015/03/danny-devio-as-frank-reynolds_small.jpg', 4],
  ['https://photo1.allfamous.org/public/people/headshots/greg-kinnear-19630617-allfamous.org-2.jpg', 2],
];

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function main() {
  const others = await getUnnamedAccounts();

  for (let i = 0; i < mockCreators.length; i++) {
    const sender = others[i];
    if (sender) {
      const creatonContract = await ethers.getContract('CreatonFactory', sender);
      const tx = await waitFor(creatonContract.deployCreator(...mockCreators[i]));
      await creatonContract.on('CreatorDeployed', (...response) => {
        const [sender, contractaddr] = response;
        console.log('creator contract address', contractaddr);
      });
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
