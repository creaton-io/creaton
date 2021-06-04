contract('TokenStaking', (accounts) => {
    let stakingToken; 
    const manyTokens = BigNumber(10).pow(18).multipliedBy(1000);
    const owner = accounts[0]; 
    const user = accounts[1]; 

    before (async () => {
        stakingToken = await stakingToken.deployed();
    });

    describe('Staking', () => {
        beforeEach(async () => {
            stakingToken = await StakingToken.new(
                owner,
                manyTokens.toString(10)
            );
        });
    })
})

it('createStake creates a stake.', async () => {
    await stakingToken.transfer(user, 3, { from: owner });
    await stakingToken.createStake(1, { from: user });

    assert.equal(await stakingToken.balanceOf(user), 2);
    assert.equal(await stakingToken.stakeOf(user), 1);
    assert.equal(
        await stakingToken.totalSupply(), 
        manyTokens.minus(1).toString(10),
    );
    assert.equal(await stakingToken.totalStakes(), 1);
});

// Distribution of rewards
it('votes are distributed.', async () => {
    await stakingToken.transfer(user, 100, { from: owner });
    await stakingToken.createStake(100, { from: user });
    await stakingToken.distributeRewards({ from: owner });
   
    assert.equal(await stakingToken.rewardOf(user), 1);
    assert.equal(await stakingToken.totalRewards(), 1);
});

it('Votes can be withdrawn.', async () => {
    await stakingToken.transfer(user, 100, { from: owner });
    await stakingToken.createStake(100, { from: user });
    await stakingToken.distributeRewards({ from: owner });
    await stakingToken.withdrawReward({ from: user });
   
    const initialSupply = manyTokens;
    const existingStakes = 100;
    const mintedAndWithdrawn = 1;

    assert.equal(await stakingToken.balanceOf(user), 1);
    assert.equal(await stakingToken.stakeOf(user), 100);
    assert.equal(await stakingToken.rewardOf(user), 0);
    assert.equal(
        await stakingToken.totalSupply(),
        initialSupply
            .minus(existingStakes)
            .plus(mintedAndWithdrawn)
            .toString(10)
        );
    assert.equal(await stakingToken.totalStakes(), 100);
    assert.equal(await stakingToken.totalRewards(), 0);
});