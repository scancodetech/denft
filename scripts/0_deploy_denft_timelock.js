const {ethers, upgrades} = require("hardhat");
const cnf = require('./cnf/cnf');
const cnfBank = require('./cnf/cnf_bank');
const utils = require('./utils');

async function main() {
    // ---------------------------------------- DeNFT -------------------------------------
    const Denft = await ethers.getContractFactory("contracts/token/DenftToken.sol:denft");
    const denft = await Denft.deploy();
    utils.SaveBankContract("Denft: "+denft.address.toString() + "\n");
    console.log("Denft: ", denft.address);
	
    await utils.Wait(2000);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });