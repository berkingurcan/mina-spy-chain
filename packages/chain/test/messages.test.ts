import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, UInt64 } from "o1js";
import { Messages } from "../src/messages";
import { log } from "@proto-kit/common";

log.setLevel("ERROR");

describe("Mina Spy Chain Messages", async () => {
    beforeAll(async () => {
        const appChain = TestingAppChain.fromRuntime({
            Messages,
        });
        
        appChain.configurePartial({
            Runtime: {
              Messages: {},
              Balances: {totalSupply: UInt64.from(10000)},
            },
        });
    
        await appChain.start();
    
        const carrieMathisonPrivateKey = PrivateKey.random();
        const carrieMathison = carrieMathisonPrivateKey.toPublicKey();

        appChain.setSigner(carrieMathisonPrivateKey);

        const messages = appChain.runtime.resolve("Messages");
    })


    it("Lets see messages what happens", async () => {

    })
})
