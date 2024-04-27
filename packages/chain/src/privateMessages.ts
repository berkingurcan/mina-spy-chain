import { runtimeModule, state, runtimeMethod, Runtime, RuntimeModule } from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, Struct } from "o1js";

export class Agent extends Struct({
    agentId: Field,
    lastMessageNumber: Field,
    securityCode: Field
}) {
    public isValid(): Bool {
        const a = this.securityCode.lessThan(100)
        const b = this.securityCode.greaterThan(9)

        return a.and(b)
    }

    public updateMessageNumber(n: Field): void {
        this.lastMessageNumber = n;
    }
}

export class MessageDetail extends Struct({
    agent: Agent,
    message: Field,
}) {
    
}

export class Message extends Struct({
    messageNumber: Field,
    messageDetails: MessageDetail
}) {
    public isValid(): Bool {
        const a = this.messageDetails.message.greaterThan(99999999999)
        const b = this.messageDetails.message.lessThan(1000000000000)

        return a.and(b)
    }
}

@runtimeModule()
export class PrivateMessages extends RuntimeModule<unknown>{
    @state() public existingAgents = StateMap.from(Field, Agent);

    @runtimeMethod()
    public initializeAgent(id: Field, agent: Agent) {
        this.existingAgents.set(id, agent);
    }

    @runtimeMethod()
    public processMessage(message: Message): any {
        // Ensure The AgentID exists in the system
        const agent = message.messageDetails.agent;
        assert(this.existingAgents.get(agent.agentId).isSome, "AGENT IS NOT EXISTS");

        // The security code matches that held for that AgentID
        const messageSecurityCode = agent.securityCode;
        assert(this.existingAgents.get(agent.agentId).value.securityCode.equals(messageSecurityCode), "INVALID SECURITY CODE!");

        // The message is of the correct length. & Security Code is a 2 Character code
        assert(message.isValid());
        assert(message.messageDetails.agent.isValid());

        // The message number is greater than the highest so far for that agent.
        const messageNumber = message.messageNumber;
        assert(this.existingAgents.get(agent.agentId).value.lastMessageNumber.lessThan(messageNumber));

        // You should update the agent state to store the last message number received
        const updatedAgent = new Agent({
            agentId: agent.agentId,
            lastMessageNumber: messageNumber,
            securityCode: messageSecurityCode
        })

        this.existingAgents.set(agent.agentId, updatedAgent)
    }
}