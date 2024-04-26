import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, UInt64 } from "o1js";
import { Messages, Agent, Message, MessageDetail } from "../src/messages";
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

        await appChain.produceBlock();

        const agent = await appChain.query.runtime.Messages.existingAgents.get(agents[0].agentId)
        expect(agent?.agentId).toEqual(agents[0].agentId);
        expect(agent?.lastMessageNumber).toEqual(agents[0].lastMessageNumber);
        expect(agent?.securityCode).toEqual(agents[0].securityCode);
    })

    it("Process a valid message", async () => {
        const validMessage = new Message({
            messageNumber: Field(1),
            messageDetails: new MessageDetail({
                agent: agents[0],
                message: Field(100000000001)
            })
        });
    
        const tx2 = await appChain.transaction(carrieMathison, () => {
            messages.processMessage(validMessage);
        });
    
        await tx2.sign();
        await tx2.send();
        await appChain.produceBlock();

        const updatedAgent = await appChain.query.runtime.Messages.existingAgents.get(agents[0].agentId);
        expect(updatedAgent?.lastMessageNumber).toEqual(Field(1));
    });

    let wrongSecurityAgent: any;
    it("Initialize agent with wrong security code", async () => {
        wrongSecurityAgent = new Agent({
            agentId: agents[1].agentId,
            lastMessageNumber: Field(0),
            securityCode: Field(999) // incorrect security code
        });

        const tx3 = await appChain.transaction(carrieMathison, () => {
            messages.initializeAgent(agents[1].agentId, wrongSecurityAgent)
        })

        await tx3.sign();
        await tx3.send();

        await appChain.produceBlock();

        const wrongAgent = await appChain.query.runtime.Messages.existingAgents.get(agents[1].agentId)
        expect(wrongAgent?.securityCode).not.toEqual(agents[1].securityCode)
    })

    it("Reject message with security code mismatch", async () => {
        const invalidMessage = new Message({
            messageNumber: Field(2),
            messageDetails: {
                agent: wrongSecurityAgent,
                message: Field(100000000001)
            }
        });

        const tx4 = await appChain.transaction(carrieMathison, () => {
            messages.processMessage(invalidMessage);
        });
    
        await tx4.sign();
        await tx4.send();
        await appChain.produceBlock();
    });
})
