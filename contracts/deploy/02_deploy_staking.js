const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deploy, execute} = hre.deployments;
  // const useProxy = !hre.network.live;

  const createToken = await hre.deployments.get("CreatonToken")

  let stakingContract = await deploy('MetatxStaking', {
    from: admin,
    args: [
      admin,
      createToken.address
    ],
    log: true
  });

  let rewardEscrow = await deploy('RewardEscrow', {
    from: admin,
    args: [
      admin,
      createToken.address,
      stakingContract.address
    ],
    log: true
  });

  console.log("Set reward rate and escrow contract...")
  let tx1 = await execute (
    'MetatxStaking',
    {from: admin},
    "setInitialReward",
    rewardEscrow.address,
    10 ** 9
  )
  console.log(tx1.transactionHash);


};

module.exports = func;
func.id = '05_deploy_staking'; // id required to prevent reexecution
func.tags = ['CreatonStaking'];
