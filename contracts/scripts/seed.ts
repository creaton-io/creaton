import {getUnnamedAccounts, ethers} from '@nomiclabs/buidler';

const mockCreators = [
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Alice', 8],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Bob', 5],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Carl', 10],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Dave', 8],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Elaine', 5],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Frank', 4],
  ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'Greg', 2],
];

function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function main() {
  const others = await getUnnamedAccounts();
  for (let i = 0; i < mockCreators.length; i++) {
    const sender = others[i];
    if (sender) {
      const creatonContract = await ethers.getContract('CreatonFactory', sender);
      await waitFor(creatonContract.deployCreator(...mockCreators[i]));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
