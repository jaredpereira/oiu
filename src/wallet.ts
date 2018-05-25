import * as os from 'os'
import * as fs from 'fs'
import * as ethers from 'ethers'

import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as ora from 'ora'

export default async function getWallet():Promise<any | false> {
  let walletLocation = os.homedir() + '/.oiu.wallet.json'
  let decryptingSpinner = ora(chalk.yellow("decrypting wallet"))
  try {
    let walletJSON = JSON.parse(fs.readFileSync(walletLocation).toString())
    let password = await inquirer.prompt<{password}>([
      {type:'password', name: 'password', message: chalk.blue('enter your password')}
    ])

    decryptingSpinner.start()
    let wallet = await ethers.Wallet.fromEncryptedWallet(walletJSON, password.password)
    decryptingSpinner.stop()
    return wallet
  }
  catch(e){
    decryptingSpinner.stop()
    if(e === "invalid wallet JSON"){
      console.log(chalk.red("invaled oiu.wallet.json file"))
      return false
    }
    if(e.message.indexOf("invalid password") !== -1) {
      console.log(chalk.red("wrong password"))
      return getWallet()
    }
    return createWallet()
  }
}

async function createWallet(){
  let walletLocation = os.homedir() + '/.oiu.wallet.json'
  let create = await inquirer.prompt<{confirm}>([
    {type: 'confirm',
     name: 'confirm',
     message: chalk.blue('No wallet found, would you like to create one?')
    }
  ])
  if(!create.confirm) return false

  const getPassword = async ():Promise<string> => {
    let input = await inquirer.prompt<{initial, confirm}>([
      {
        type: 'password',
        name: 'initial',
        message: chalk.blue('Enter a strong password')
      },
      {
        type: 'password',
        name: 'confirm',
        message: chalk.blue('Reenter your password')
      }
    ])

    if(input.initial === input.confirm) return input.initial

    console.log(chalk.red("Your passwords didn't match, try again"))
    return await getPassword()
  }

  let password = await getPassword()
  let wallet = ethers.Wallet.createRandom()
  let encryptedWallet = await wallet.encrypt(password)

  fs.writeFileSync(walletLocation, JSON.stringify(encryptedWallet))
  return wallet
}
