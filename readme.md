
# XPPAY Staking.   
 Initially, 1 PPAY is equal to 1 xPPAY, but the price in relation to xPPAY to PPAY changes when taking into account the filling of the xPPAY pool from the treasury. Thus, xPPAY is always more expensive than PPAY. The distribution of PPAY to xPPAY is proportional to the share of ownership xPPAY.

## FeeCollector.sol  
Plasma Finance Treasury ecosystem commissions in ERC20 tokens are sent to the FeeCollector contract, everyone can perform the "convert" function to start the commission distribution procedure.
This means that ERC20 tokens are converted to PPAY tokens in PlasmaSwap, and the result will be split between the configured accounts. In this moment,
there are 3 majorities: 
- xPPAY 
- Governance 
- Operations 

## Addresses 

### ROUTER ADDRESS 

PlasmaSwap
```
[ChainId.MAINNET]: '0x5ec243F1F7ECFC137e98365C30c9A28691d86132'
```

### FACTORY ADDRESS 

PlasmaSwap
```
[ChainId.MAINNET]: '0xd87Ad19db2c4cCbf897106dE034D52e3DD90ea60'
```

### INIT CODE HASH

PlasmaSwap
```
[ChainId.MAINNET]: '611ee9501fb19c9df82695e66f6c58d69d86907b531dfbed652231515ae84081',
```
In-depth documentation on xPPAY is available at [docs.plasma.finance](https://docs.plasma.finance)



