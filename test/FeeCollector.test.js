const MockERC20 = artifacts.require('MockERC20');
const FeeCollector = artifacts.require('FeeCollector');
const PlasmaswapPair = artifacts.require('PlasmaswapPair');
const PlasmaswapFactory = artifacts.require('PlasmaswapFactory');

contract('FeeCollector', ([alice, bob, maker, minter]) => {
    beforeEach(async () => {
        this.factory = await PlasmaswapFactory.new(alice, { from: alice });
        this.ppay = await MockERC20.new('TestPpayToken', 'TestPPAY', '100000000', { from: minter });
        this.weth = await MockERC20.new('WETH', 'WETH', '100000000', { from: minter });
        this.token1 = await MockERC20.new('TOKEN1', 'TOKEN', '100000000', { from: minter });
        this.token2 = await MockERC20.new('TOKEN2', 'TOKEN2', '100000000', { from: minter });
        this.maker = await FeeCollector.new(this.factory.address, this.ppay.address, this.weth.address, maker, alice, bob);
        this.ppayWETH = await PlasmaswapPair.at((await this.factory.createPair(this.weth.address, this.ppay.address)).logs[0].args.pair);
        this.wethToken1 = await PlasmaswapPair.at((await this.factory.createPair(this.weth.address, this.token1.address)).logs[0].args.pair);
        this.wethToken2 = await PlasmaswapPair.at((await this.factory.createPair(this.weth.address, this.token2.address)).logs[0].args.pair);
        this.token1Token2 = await PlasmaswapPair.at((await this.factory.createPair(this.token1.address, this.token2.address)).logs[0].args.pair);
    });

    it('should make xPPAYs successfully', async () => {
        await this.factory.setFeeTo(this.maker.address, { from: alice });
        await this.weth.transfer(this.ppayWETH.address, '10000000', { from: minter });
        await this.ppay.transfer(this.ppayWETH.address, '10000000', { from: minter });
        await this.ppayWETH.mint(minter);
        await this.weth.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.token1.transfer(this.wethToken1.address, '10000000', { from: minter });
        await this.wethToken1.mint(minter);
        await this.weth.transfer(this.wethToken2.address, '10000000', { from: minter });
        await this.token2.transfer(this.wethToken2.address, '10000000', { from: minter });
        await this.wethToken2.mint(minter);
        await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token1Token2.mint(minter);
        // Fake some revenue
        await this.token1.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '100000', { from: minter });
        await this.token1Token2.sync();
        await this.token1.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token2.transfer(this.token1Token2.address, '10000000', { from: minter });
        await this.token1Token2.mint(minter);
        // Maker should have the LP now
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '16528');
        // After calling convert, maker should have PPAY value at ~1/6 of revenue
        await this.maker.convert(this.token1.address, this.token2.address);
        assert.equal((await this.ppay.balanceOf(alice)).valueOf(), '14834');
        assert.equal((await this.ppay.balanceOf(bob)).valueOf(), '4944');
        assert.equal((await this.ppay.balanceOf(maker)).valueOf(), '13186');
        assert.equal((await this.token1Token2.balanceOf(this.maker.address)).valueOf(), '0');
        // Should also work for PPAY-ETH pair
        await this.ppay.transfer(this.ppayWETH.address, '100000', { from: minter });
        await this.weth.transfer(this.ppayWETH.address, '100000', { from: minter });
        await this.ppayWETH.sync();
        await this.ppay.transfer(this.ppayWETH.address, '10000000', { from: minter });
        await this.weth.transfer(this.ppayWETH.address, '10000000', { from: minter });
        await this.ppayWETH.mint(minter);
        assert.equal((await this.ppayWETH.balanceOf(this.maker.address)).valueOf(), '16537');
    });
});