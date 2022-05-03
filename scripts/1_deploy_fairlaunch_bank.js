const {ethers, upgrades} = require("hardhat");
const cnf = require('./cnf/cnf');
const cnfBank = require('./cnf/cnf_bank');
const utils = require('./utils');

async function main() {
    // ---------------------------------------- FairLaunch ---------------------------------
    const FairLaunch = await ethers.getContractFactory("contracts/rewards/FairLaunch.sol:FairLaunch");
    const fairLaunch = await upgrades.deployProxy(FairLaunch,[
        cnf.Denft,
        cnf.FairLaunchDevAddr,
        ethers.utils.parseEther(cnf.denftPerBlock),
        cnf.FairLaunchStartBlock,
        cnf.FairLaunchBonusEndBlock
    ], { initializer: 'initialize', unsafeAllow: ['delegatecall']});
    utils.SaveBankContract("FairLaunch: "+fairLaunch.address.toString() + "\n");
    console.log("fairLaunch: ", fairLaunch.address);

	const Denft = await ethers.getContractFactory("contracts/token/DenftToken.sol:DeNFT");
    const denft = await Denft.attach(cnf.Denft);
    await denft.transferOperator(fairLaunch.address);
    await denft.transferOwnership(cnf.ContractOwner);
    console.log("transfer denft Operator OK");

    // ---------------------------------------- Bank ---------------------------------
    const TripleSlopeModel = await ethers.getContractFactory("contracts/bank_config/InterestModel.sol:TripleSlopeModel");
    const tripleSlopeModel = await TripleSlopeModel.deploy();
    utils.SaveBankContract("TripleSlopeModel: "+tripleSlopeModel.address.toString() + "\n");
    console.log("tripleSlopeModel: ", tripleSlopeModel.address);

    const BankConfig = await ethers.getContractFactory("contracts/bank_config/BankConfig.sol:BankConfig");
    const bankConfig = await BankConfig.deploy();
    utils.SaveBankContract("BankConfig: "+bankConfig.address.toString() + "\n");
    console.log("bankConfig: ", bankConfig.address);

    await bankConfig.setParams(cnf.BankConfGetReserveBps, cnf.BankConfGetLiquidateBps, tripleSlopeModel.address);
    console.log("bank conf set params ok");
    //
    const Bank = await ethers.getContractFactory("contracts/Bank.sol:Bank");
    const bank = await upgrades.deployProxy(Bank,[
        bankConfig.address
    ], { initializer: 'initialize', unsafeAllow: ['delegatecall']});
    utils.SaveBankContract("Bank: "+bank.address.toString() + "\n");
    console.log("bank: ", bank.address);

    // ---------------------------------------- Bank AddBank ---------------------------------
    for (let [_, item] of Object.entries(cnfBank.BankToken)) {
        await bank.addBank(item.Addr, item.Name);
        console.log("add bank ok: " + item.Name);
		await utils.Wait(10000);
    }

    utils.SaveBankContract("----------------------------- IbToken ---------------------------------------" + "\n");

    await utils.Wait(20000);
	
    await utils.Wait(2000);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });