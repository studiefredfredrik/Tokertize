// If you're reading this then you should know that these tests really are just for the 
// test contract, and not for the current version of the contract :)
const NftMarathon = artifacts.require("NftMarathon");

contract('NftMarathon', (accounts) => {
  it('should not have any NFTs to start with', async () => {
    const nftMarathonInstance = await NftMarathon.new();
    const balance = await nftMarathonInstance.balanceOf.call(accounts[0]);
    console.log(balance.valueOf())
    assert.equal(balance.valueOf(), 0, "No NFTs when we begin");
  });
  it('should be able to mint an NFT', async () => {
    const nftMarathonInstance = await NftMarathon.new();
    await nftMarathonInstance.mintUniqueTokenTo(accounts[1], {from: accounts[1]});
    const balance = await nftMarathonInstance.balanceOf.call(accounts[1]);
    assert.equal(balance.valueOf(), 1, "Guy didnt get that NFT :(");
  });
  it('should be able to get Owners mapping', async () => {
    const nftMarathonInstance = await NftMarathon.new();
    let ownersBefore = await nftMarathonInstance.getAll.call();
    console.log('OWNERS::', ownersBefore)
    assert.equal(ownersBefore.length, 0)

    await nftMarathonInstance.mintUniqueTokenTo(accounts[1], {from: accounts[1]});

    let ownersAfter = await nftMarathonInstance.getAll.call();
    console.log('OWNERS::', ownersAfter)
    assert.equal(ownersAfter.length, 1)
  });
});
