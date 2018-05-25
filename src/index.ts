import * as rpt from 'read-package-tree'
import * as pify from 'pify'
import * as ethAddress  from 'ethereum-address'

let readPackageTree = pify(rpt)

export interface Payment {
  amount: number,
  to: {
    name: string,
    address?: string
  }
}

export async function getPaymentFunction (packageName?:string)
:Promise<((amount: number) => Array<Payment>) | false> {
  let paymentFunction

  if (packageName) {
    paymentFunction = await lookup(packageName)
  }
  else {
    try {
      paymentFunction = await import(process.cwd() + '/oiu.config.js')
    }
    catch(e){
      return false
    }
  }

  return paymentFunction
}

export async function searchForOiuConfigs():Promise<Array<string>> {
  let haveOiu = []
  let packages = await readPackageTree('./')
  for(let i = 0; i < packages.children.length; i++){
    try {
      let paymentFunction = await import(packages.children[i].realpath + '/oiu.config.js')
      if(paymentFunction) haveOiu.push(packages.children[i].name)
    }
    catch (e){}
  }
  return haveOiu
}

export async function lookup(name: string)
:Promise<((value:number) => Array<Payment>) | false > {
  let packages = await readPackageTree('./')

  if(packages.error){
    return false
  }

  let thing = packages.children.find( (child:rpt.Node) => {
    return child.name === name
  })
  try {
    let paymentFunction = await import(thing.realpath + '/oiu.config.js')
    return paymentFunction
  }
  catch (e){
    return false
  }
}

export async function parsePayments(payments: Array<Payment>)
: Promise<Array<Payment>> {
  for(var key = 0; key < payments.length; key++){
    let payment = payments[key]
    if(ethAddress.isAddress(payment.to.address)) continue

    let paymentFunction = await lookup(payment.to.name)
    if(paymentFunction) {
      let packagePayments = await parsePayments(paymentFunction(payment.amount))

      let parsedValue = packagePayments.reduce((acc, payment) => {
        return acc + payment.amount
      }, 0)

      if(parsedValue <= payment.amount ) {
        payments.splice(key, 1)
        payments = payments
          .concat(packagePayments)
          .reduce((acc, payment) => {
            for(var i = 0; i < acc.length; i++){
              if(acc[i].to.address === payment.to.address){
                acc[i].amount += payment.amount

                return acc
              }
            }
            acc.push(payment)
            return acc
          }, [])
      }
    }
  }
  return payments
}
