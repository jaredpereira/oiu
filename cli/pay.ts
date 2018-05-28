import yargs = require("yargs")

import * as ethers from 'ethers'
import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as Table from 'cli-table'
import * as ora from 'ora'

import {parsePayments, getPaymentFunction} from '../src/'
import getWallet from '../src/wallet'

export default {
  command: ["pay [packageName]"],
  aliases: ['p'],
  describe: "send crypto to a package",
  builder: (yargs) => {
    return yargs
      .positional('packageName', {
        describe: "an npm package you depend on",
        type: "string"
    })
  },
  handler: async (args) => {
    let paymentFunction
    paymentFunction = await getPaymentFunction(args.packageName)

    if(!paymentFunction){
      return console.log(chalk.red('No oiu.config.js found'))
    }

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

    let amount = {value: 100000000000000000000}
    while(amount.value > parseFloat(balance)){
      amount = await inquirer.prompt<{value}>({
        type: "number",
        name: "value",
        message: chalk.blue("ETH amount to transfer"),
      })
      if(amount.value > parseFloat(balance)) console.log(chalk.red('Insufficient balance for this transaction'))
    }

    let payments = await parsePayments(paymentFunction(amount.value))

    let paymentTable = new Table({
      head: ["Name", "Address", "Amount (ETH)"]
    })

    let total = 0
    for(let i = 0; i < payments.length; i++){
      let payment = payments[i]
      paymentTable.push([
        payment.to.name,
        payment.to.address,
        payment.amount
      ])
      total += payment.amount
    }
    paymentTable.push(["TOTAL", "", total])

    console.log('\n' + paymentTable.toString() + '\n')

    let confirm = await inquirer.prompt<{confirm:boolean}>({
      type: 'confirm',
      name: 'confirm',
      message: chalk.blue('send ETH?')
    })

    if(confirm.confirm) {
      for(let i = 0; i < payments.length; i++){
        let payment = payments[i]
        wallet.send(payment.to.address, ethers.utils.parseEther(payment.amount.toString()))
      }
    }

    console.log(chalk.bold.green("Thank you for supporting people!"))
  }
}
