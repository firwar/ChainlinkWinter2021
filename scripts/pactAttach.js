    const [deployer] = await ethers.getSigners();
  
    console.log(
      'Creating Listing with the account::',
      deployer.address,
    );
  
    console.log('Account balance:', (await deployer.getBalance()).toString());
 
    const Pact = await ethers.getContractFactory("Pact")

    // Edit deployed gateway address here
    const contract = await Pact.attach("0x9488548bA591Eabe11b94C2788CD9a144f68e127")

    await contract.userAddressToNestData(deployer.address,0)

//    await contract.connect(deployer).requestGoogleNestData(deployer.address)

    console.log(ethers.utils.formatEther(await contract.regionToDemandData(0,0)))
    //console.log(ethers.utils.formatEther(await contract.regionToDemandData(0,0))):w
    