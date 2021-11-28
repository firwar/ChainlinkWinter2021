const { expect } = require('chai');

describe('Pact contract', () => {
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
    let region = 0;
    let reward = 0;

    Pact = await ethers.getContractFactory('Pact');
    pact = await Pact.deploy(owner.address, region, reward);

    await pact.deployed();
    pact.on('*', (event) => {
      //   console.log(event)
    });
  });

  it('Test 1', async () => {

    // Insert test here
    expect(1).to.equal(1);
    await pact.populateParticipant(user.address);
    await pact.populateParticipant(owner.address);
    //console.log(pact);
    let energy = await pact.userAddressToEnergyCountCycle(user.address);
    console.log(energy.toNumber());
    let compDataLength = await pact.userAddressToComplianceDataLength(user.address);
    console.log(compDataLength.toNumber());
    const compData = await pact.getComplianceDataArray(user.address)
    console.log(compData);
    const tempData = await pact.getTempDataArray(user.address)
    console.log(tempData);

    const participants = await pact.getParticipants();
    console.log(participants);
    console.log(participants.length);

  });

});
