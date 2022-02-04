const { diff } = require('json-diff');
const _CONTRACTS_KEY = 'contracts'
const _FUNCTIONS_KEY = 'diamond'
// TODO: use const to access diamond.json file

module.exports = class DiamondDifferentiator {
  constructor(o1, o2) {
    this.d = diff(o1, o2)
  }
  getFunctionsFacetsToAdd() {
    if (!this.d || !this.d.diamond) {
      return []
    }
    let functionsToAdd = Object.keys(this.d.diamond).filter(fn => {
      return fn.endsWith('__added')
    })

    let functionsFacetsToAdd = functionsToAdd.map(fn => {
      return {
        fn: `${fn.substring(0, fn.length - '__added'.length)}`,
        facet: this.d.diamond[fn]
      }
    })

    return functionsFacetsToAdd
  }

  getFunctionsFacetsToRemove() {
    if (!this.d || !this.d.diamond) {
      return []
    }
    let functionsToAdd = Object.keys(this.d.diamond).filter(fn => {
      return fn.endsWith('__deleted')
    })

    let functionsFacetsToAdd = functionsToAdd.map(fn => {
      return {
        fn: `${fn.substring(0, fn.length - '__deleted'.length)}`,
        facet: this.d.diamond[fn]
      }
    })

    return functionsFacetsToAdd
  }

  getFunctionFacetsToReplace() {
    if (!this.d || !this.d.diamond) {
      return []
    }
    let functionsToReplace = Object.keys(this.d.diamond).filter(fn => {
      const facet = this.d.diamond[fn]
      return typeof facet === 'object'
    })

    let functionsFacetsToReplace = functionsToReplace.map(fn => {
      return {
        fn,
        facet: this.d.diamond[fn].__new
      }
    })

    return functionsFacetsToReplace
  }

  getContractsToReplace() {
    if (!this.d || !this.d.contracts) {
      return []
    }
    let contractsToReplace = Object.keys(this.d.contracts).filter(fn => {
      return this.d.contracts[fn].hasOwnProperty('address__deleted') && this.d.contracts[fn].hasOwnProperty('path__added')
    })

    let contractsInfoToReplace = contractsToReplace.map(fn => {
      return {
        name: fn,
        type: 'local',
        path: this.d.contracts[fn].path__added
      }
    })

    return contractsInfoToReplace
  }

  getContractsToDeploy() {
    if (!this.d || !this.d.contracts) {
      return []
    }
    let contractsToDeploy = Object.keys(this.d.contracts).filter(fn => {
      return fn.endsWith('__added') && this.d.contracts[fn].type === 'local'
    })

    let contractsInfoToDeploy = contractsToDeploy.map(fn => {
      return this.d.contracts[fn]
    })

    return contractsInfoToDeploy.concat(this.getContractsToReplace(this.d))
  }
}