import * as ethers from 'ethers'
import * as ora from 'ora'
import chalk from 'chalk'

import {searchForOiuConfigs} from '../src/index'
import getWallet from '../src/wallet'

export default {
  command: ["init"],
  aliases: ["i"],
  describe: "initialize a wallet and find dependencies using oiu",
  handler: async (args) => {
    let wallet = await getWallet()
    wallet.provider = ethers.providers.getDefaultProvider('rinkeby')

    let fetchingSpinner = ora(chalk.yellow("fetching account info"))
    fetchingSpinner.start()
    let address = wallet.address
    let balance = ethers.utils.formatEther(await wallet.getBalance())
    fetchingSpinner.stop()

    console.log(
      '\n Address: ' +
        chalk.underline.green(address),
      "\n Balance: " +
        chalk.underline.green(balance + " ETH \n")
    )
    let packages = await searchForOiuConfigs()
    console.log(chalk.green("You depend on ") +
                chalk.underline.bold.green(packages.length.toString()) +
                chalk.green(" package using oiu: "))
    for(let i=0; i<packages.length; i++) {
      console.log(chalk.bold.underline.green(packages[i]))
    }
  }
}
