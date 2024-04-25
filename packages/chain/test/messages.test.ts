import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, UInt64 } from "o1js";
import { Messages, Agent } from "../src/messages";
import { log } from "@proto-kit/common";

log.setLevel("ERROR");



describe("Mina Spy Chain Messages", () => {
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

        const agents: Agent[] = []

        for (let i = 1; i <= 5; i++) {
            agents.push(new Agent({
                agentId: Field(i),
                lastMessageNumber: Field(0),
                securityCode: Field(i*10)
            }));
        }

        console.log(agents)
    })


    it("Initialize Agent", async () => {

    })
})
