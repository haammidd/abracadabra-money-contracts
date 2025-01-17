const shell = require('shelljs');

module.exports = async function (taskArgs, hre) {
    const { getChainIdByNetworkName, foundryDeployments } = hre;

    const apiKey = hre.network.config.api_key;
    const forgeVerifyExtraArgs = hre.network.config.forgeVerifyExtraArgs;
    const chainId = getChainIdByNetworkName(hre.network.name);
    const deployment = await foundryDeployments.getDeployment(taskArgs.deployment, chainId);
    const address = deployment.address;
    const constructorArgs = deployment.args_data;
    const artifact = await foundryDeployments.getArtifact(taskArgs.artifact);
    const numOfOptimizations = artifact.metadata.settings.optimizer.runs;
    const compiler = artifact.metadata.compiler.version;

    let args = "";
    if (apiKey) {
        args = `-e ${apiKey} ${forgeVerifyExtraArgs || ""}`;
    } else {
        args = forgeVerifyExtraArgs || "";
    }

    const cmd = `forge verify-contract --chain-id ${chainId} --num-of-optimizations ${numOfOptimizations} --watch --constructor-args ${constructorArgs} --compiler-version ${compiler} ${address} ${taskArgs.artifact} ${args}`;
    console.log(cmd);

    const result = await shell.exec(cmd, { fatal: true });

    if (result.code != 0) {
        process.exit(result.code);
    }
}