import {getUnnamedAccounts, ethers} from 'hardhat';

const mockCreators = [
  ['https://briano88.files.wordpress.com/2015/03/danny-devio-as-frank-reynolds_small.jpg', 'Frank', 4],
  ['https://photo1.allfamous.org/public/people/headshots/greg-kinnear-19630617-allfamous.org-2.jpg', 'Greg', 2],
  ['https://i.pinimg.com/originals/d0/ee/77/d0ee77ca345a7ae89a2e919d804e84c7.jpg', 'Elaine', 5],
  [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Dave_Chappelle_%2842791297960%29_%28cropped%29.jpg/1200px-Dave_Chappelle_%2842791297960%29_%28cropped%29.jpg',
    'Dave',
    8,
  ],
  ['https://www.bbvaopenmind.com/wp-content/uploads/2018/02/Sagan-1.jpg', 'Carl', 10],
  ['https://www.biography.com/.image/t_share/MTIwNjA4NjMzOTU5NTgxMTk2/bob-ross-9464216-1-402.jpg', 'Bob', 5],
  ['https://media.heartlandtv.com/images/Alice1.PNG', 'Alice', 8],
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
