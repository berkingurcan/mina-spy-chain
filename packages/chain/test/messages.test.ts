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

        const block = await appChain.produceBlock();
        expect(block?.transactions[0].status.toBoolean()).toBe(true);

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
        const block = await appChain.produceBlock();
        expect(block?.transactions[0].status.toBoolean()).toBe(true);

        const updatedAgent = await appChain.query.runtime.Messages.existingAgents.get(agents[0].agentId);
        expect(updatedAgent?.lastMessageNumber).toEqual(Field(1));
    });

    let wrongSecurityAgent: any;
    it("Initialize agent with wrong security code", async () => {
        wrongSecurityAgent = new Agent({
            agentId: agents[1].agentId,
            lastMessageNumber: Field(0),
            securityCode: Field(999)
        });

        const tx3 = await appChain.transaction(carrieMathison, () => {
            messages.initializeAgent(agents[1].agentId, wrongSecurityAgent)
        })

        await tx3.sign();
        await tx3.send();

        const block = await appChain.produceBlock();
        expect(block?.transactions[0].status.toBoolean()).toBe(true);

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
        const block = await appChain.produceBlock();
        expect(block?.transactions[0].status.toBoolean()).toBe(false);
    });

    it("Reject message with invalid length", async () => {
        const invalidLengthMessage = new Message({
            messageNumber: Field(3),
            messageDetails: {
                agent: agents[0],
                message: Field(999)
            }
        });

        const tx5 = await appChain.transaction(carrieMathison, () => {
            messages.processMessage(invalidLengthMessage);
        });

        await tx5.sign();
        await tx5.send();
        const block = await appChain.produceBlock();

        expect(block?.transactions[0].status.toBoolean()).toBe(false);
    });

    it("Reject message with invalid sequence number", async () => {
        const lowerNumberMessage = new Message({
            messageNumber: Field(0), // Lower than last valid
            messageDetails: {
                agent: agents[0],
                message: Field(120000000001)
            }
        });
    
        const tx6 = await appChain.transaction(carrieMathison, () => {
            messages.processMessage(lowerNumberMessage);
        });

        await tx6.sign();
        await tx6.send();
        const block = await appChain.produceBlock();

        expect(block?.transactions[0].status.toBoolean()).toBe(false);
    });

    it("Reject message from non-existent agent", async () => {
        const nonExistentAgentMessage = new Message({
            messageNumber: Field(1),
            messageDetails: {
                agent: new Agent({
                    agentId: Field(999), // Non-existent agent ID
                    lastMessageNumber: Field(0),
                    securityCode: Field(10)
                }),
                message: Field(100000000001)
            }
        });
    
        const tx7 = await appChain.transaction(carrieMathison, () => {
            messages.processMessage(nonExistentAgentMessage);
        });

        await tx7.sign();
        await tx7.send();
        const block = await appChain.produceBlock();

        expect(block?.transactions[0].status.toBoolean()).toBe(false);
    });
    
})
