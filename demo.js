const { ethers } = require("ethers");
const sudoABI = require("./sudoabi.json");
const erc1155ABI = require("./erc1155abi.json");

const provider = new ethers.providers.JsonRpcProvider(
    'https://api.evm.eosnetwork.com'
)



function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}



async function sellecho(buypool, num, traders) {

    for (let i = 0; i < traders.length; i++) {
        const trader = new ethers.Wallet(
            traders[i],
            provider
        )
        let router = new ethers.Contract("0x3d51749Cb2Db7355392100BAc202216BE7071E66", sudoABI, trader)
        let echo = new ethers.Contract('0x31753b319f03a7ca0264A1469dA0149982ed7564', erc1155ABI, trader)

        console.log('xxxx', await provider.getBlockNumber())
        let isApproval = await echo.isApprovedForAll(trader.address, router.address)
        console.log(`${trader.address} is approved:`, isApproval)
        if (!isApproval) {
            let apptx = await echo.setApprovalForAll(router.address, true)
            await apptx.wait(2)
        }

        while (true) {
            try {
                let sellechotx = await router.robustSwapNFTsForToken(
                    [
                        [
                            [buypool, [0], [num.toString()]],
                            "0",
                        ]
                    ],
                    trader.address,
                    2000000000
                )
                await sellechotx.wait(2)
                console.log(`${trader.address} sell finish`)
                await sleep(20)
                break
            } catch (e) {
                console.log(e)
                await sleep(20)
            }
        }
    }
}


async function buyecho(sellpool, num, traders, value) {
    for (let i = 0; i < traders.length; i++) {
        const trader = new ethers.Wallet(
            traders[i],
            provider
        )
        let router = new ethers.Contract("0x3d51749Cb2Db7355392100BAc202216BE7071E66", sudoABI, trader)

        while (true) {
            try {
                let sellechotx = await router.robustSwapETHForSpecificNFTs(
                    [
                        [
                            [sellpool, [0], [num.toString()]],
                            ethers.utils.parseEther(value.toString())
                        ],
                    ],
                    trader.address,
                    trader.address,
                    2000000000,
                    { value: ethers.utils.parseEther(value.toString()) }
                )
                await sellechotx.wait(2)
                console.log(`${trader.address} buy finish`)
                await sleep(20)
                break
            } catch (e) {
                console.log(e)
                await sleep(20)
            }
        }
    }
}






function buy() {
    let traders = ['', '']   // your privatekey

    let sellpool = '0x09982803C58Bc723Abaa2Fc119BC3A1610FaD34C'        // 做市商建的卖池

    let num = 1     //  each buy number

    let value = 1   //  each buy value


    buyecho(sellpool, num, traders, value)
}


function sell() {
    let traders = ['', '']   // your privatekey
    let buypool = '0x43f89085c31e3565934847176782e2CC9c7de73B'         // 做市商建的买池
    let num = 1     //  each sell number

    sellecho(buypool, num, traders)
}



// buy()
// sell()