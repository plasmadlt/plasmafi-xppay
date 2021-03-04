const { expectRevert } = require('@openzeppelin/test-helpers');
const MockERC20 = artifacts.require('MockERC20');
const PlasmaStaking = artifacts.require('PlasmaStaking');

contract('PlasmaStaking', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.ppay = await MockERC20.new('TestPpayToken', 'TestPPAY', '300', { from: alice });
        this.staking = await PlasmaStaking.new(this.ppay.address, { from: alice });
        await this.ppay.transfer(bob, '100', { from: alice });
        await this.ppay.transfer(carol, '100', { from: alice });
    });

    it('should not allow enter if not enough approve', async () => {
        await expectRevert(
            this.staking.enter('100', { from: alice }),
            'ERC20: transfer amount exceeds allowance',
        );
        await this.ppay.approve(this.staking.address, '50', { from: alice });
        await expectRevert(
            this.staking.enter('100', { from: alice }),
            'ERC20: transfer amount exceeds allowance',
        );
        await this.ppay.approve(this.staking.address, '100', { from: alice });
        await this.staking.enter('100', { from: alice });
        assert.equal((await this.staking.balanceOf(alice)).valueOf(), '100');
    });

    it('should not allow withraw more than what you have', async () => {
        await this.ppay.approve(this.staking.address, '100', { from: alice });
        await this.staking.enter('100', { from: alice });
        await new Promise(r => setTimeout(r, 2000));
        await expectRevert(
            this.staking.leave('200', { from: alice }),
            'ERC20: burn amount exceeds balance',
        );
    });

    it('should work with more than one participant', async () => {
        await this.ppay.approve(this.staking.address, '100', { from: alice });
        await this.ppay.approve(this.staking.address, '100', { from: bob });
        // Alice enters and gets 20 shares. Bob enters and gets 10 shares.
        await this.staking.enter('20', { from: alice });
        await this.staking.enter('10', { from: bob });
        assert.equal((await this.staking.balanceOf(alice)).valueOf(), '20');
        assert.equal((await this.staking.balanceOf(bob)).valueOf(), '10');
        assert.equal((await this.ppay.balanceOf(this.staking.address)).valueOf(), '30');
        // PlasmaStaking get 20 more PPAYs from an external source.
        await this.ppay.transfer(this.staking.address, '20', { from: carol });
        // Alice deposits 10 more PPAYs. She should receive 10*30/50 = 6 shares.
        await this.staking.enter('10', { from: alice });
        assert.equal((await this.staking.balanceOf(alice)).valueOf(), '26');
        assert.equal((await this.staking.balanceOf(bob)).valueOf(), '10');
        // Bob withdraws 5 shares. He should receive 5*60/36 = 8 shares
        await new Promise(r => setTimeout(r, 2000));
        await this.staking.leave('5', { from: bob });
        assert.equal((await this.staking.balanceOf(alice)).valueOf(), '26');
        assert.equal((await this.staking.balanceOf(bob)).valueOf(), '5');
        assert.equal((await this.ppay.balanceOf(this.staking.address)).valueOf(), '52');
        assert.equal((await this.ppay.balanceOf(alice)).valueOf(), '70');
        assert.equal((await this.ppay.balanceOf(bob)).valueOf(), '98');
    });
});
