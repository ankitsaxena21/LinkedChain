const LinkedChain = artifacts.require("LinkedChain");
module.exports = function(deployer, network, accounts) {
 deployer.deploy(LinkedChain,{from: accounts[0]});
};
