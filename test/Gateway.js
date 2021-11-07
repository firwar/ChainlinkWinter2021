const { expect } = require('chai');

describe('Gateway contract', () => {
  // Network specific
  let provider;

  // Contract specific
  let owner;
  let user;

  beforeEach(async () => {
    // Using hardhat local blockchain instead
    provider = await ethers.provider;
    // provider = await ethers.getDefaultProvider();

    [owner, user] = await ethers.getSigners();

    Gateway = await ethers.getContractFactory('Gateway');
    gateway = await Gateway.deploy();

    await gateway.deployed();
    gateway.on('*', (event) => {
      //   console.log(event)
    });
  });

  it('Test 1', async () => {

    // Insert test here
    expect(1).to.equal(1);
  });

});
