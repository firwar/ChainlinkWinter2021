async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    'Deploying contracts with the account:',
    deployer.address,
  );

  let region = 0;
  let reward = 0;


  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Pact = await ethers.getContractFactory('Pact');
  const pact = await Pact.deploy(deployer.address, region, reward);


  console.log('Pact address:', pact.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
