<div align="center">
  <div>
	<img width="500" src="assets/logo.svg" alt="oiu">
  </div>
  <br>
  <p>A little tool for moving open-source money</p>
</div>


# README 

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/oiu.svg
[npm-url]: https://npmjs.org/package/oiu

oiu is a command line application that allows you to send cryptocurrency to
software packages.

A package author defines `oiu.config.js` in their root directory which handles
payments. They can direct funds to Ethereum addresses or to other packages they
depend on.

![example gif](assets/example.gif)


<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [README](#readme)
    - [Getting Started](#getting-started)
        - [Package Authors](#package-authors)
            - [Don't have an Ethereum Wallet?](#dont-have-an-ethereum-wallet)
            - [Dependencies](#dependencies)
        - [Package Users](#package-users)
    - [Contributing](#contributing)
        - [How to Contribute](#how-to-contribute)
        - [Repository layout](#repository-layout)

<!-- markdown-toc end -->


## Getting Started

You can install oiu with `npm i -g oiu` or just use `npx oiu` when using it.

### Package Authors
If you want to set up your package to receive payments you will need to create
an `oiu.config.js` file in your root directory. This file exports a function
that takes a amount and returns an array of object defining how that amount is
split up.

You can go pretty wild here, but here's a simple example to get you started

```
module.exports = (amount) => {
  return [
    {
      to: {
        address: ${YOUR ADDRESS HERE},
        name: ${YOUR NAME HERE}
      },
      amount: amount
    },
    ]
}

```

#### Don't have an Ethereum Wallet?

You can create a wallet with `oiu init`

#### Dependencies
If you depend on oiu, and would like to send us something like 1% of funds
donated to you, simply add something this to your function! (remember to remove
the 1% from else where, **you can't disperse more than was put in**)

```
    {
      to: {
        name: 'oiu',
      },
      amount: amount/100
    }

```

### Package Users
If you want to send to a package you depend on, it's as simple as running `npx
oiu pay [package-name]`

This will guide you setting up an Ethereum account

## Contributing
We are open for any and all contributions!

Things that could use work:

1. All text content everywhere in the app! Language is hard, come help us good it
2. CLI Options! Have something you want to do? Basically every command so far
   has default options that are limiting, help us expand what we can do
   - Deal with passing in parameters like an Ethereum Wallet file, or an amount
     to do
3. Automated generators! Writing those oiu.config.js files is pretty annoying.
   But It's Just Javascript(tm) so we can write things to make this easier, and
   potentially enable complex and automated relationships between projects.

### How to Contribute

If you have a bug/feature/idea/question open up an issue in this repository. 

If there is something you'd like to code, do so and open a PR in this
repository and reference the relevant issues.

If you just want to hangout and contribute try scrolling through open issues and
going from there.

### Repository layout

The repository is divided into two sections `cli` and `src`. 

`src` contains all the functions exported by this module.

`cli` defines commands that use these funcitons. 
