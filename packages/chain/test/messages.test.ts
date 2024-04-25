import { AppChain, TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, UInt64 } from "o1js";
import { Messages, Agent } from "../src/messages";
import { log } from "@proto-kit/common";

log.setLevel("ERROR");


describe("Mina Spy Chain Messages", () => {
    const appChain = TestingAppChain.fromRuntime({
        Messages,
    });
    
    appChain.configurePartial({
        Runtime: {
            Messages: {},
            Balances: {totalSupply: UInt64.from(10000)},
        },
    });

    let carrieMathison: any;
    let carrieMathisonPrivateKey: any;
    let messages: any;
    let agents: Agent[];

    beforeAll(async () => {
        await appChain.start();

        carrieMathisonPrivateKey = PrivateKey.random();
        carrieMathison = carrieMathisonPrivateKey.toPublicKey();
    
        appChain.setSigner(carrieMathisonPrivateKey);
    
        messages = appChain.runtime.resolve("Messages");
    
        agents = []
    
        for (let i = 1; i <= 5; i++) {
            agents.push(new Agent({
                agentId: Field(i),
                lastMessageNumber: Field(0),
                securityCode: Field(i*10)
            }));
        }
    })
    
    it("Initialize Agent", async () => {
        const tx1 = await appChain.transaction(carrieMathison, () => {
            messages.initializeAgent(agents[0].agentId, agents[0])
        })

        await tx1.sign();
        await tx1.send();

        const block = await appChain.produceBlock();

        const agent = await appChain.query.runtime.Messages.existingAgents.get(agents[0].agentId)
        expect(agent?.agentId).toEqual(agents[0].agentId);
        expect(agent?.lastMessageNumber).toEqual(agents[0].lastMessageNumber);
        expect(agent?.securityCode).toEqual(agents[0].securityCode);
    })
})
