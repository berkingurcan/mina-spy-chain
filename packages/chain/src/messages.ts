import { runtimeModule, state, runtimeMethod, Runtime, RuntimeModule } from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, Struct } from "o1js";

class Agent extends Struct({
    agentId: Field,
    lastMessageNumber: Field,
    securityCode: Field
}) {
    public isValid(): void {
        this.securityCode.assertLessThan(100)
        this.securityCode.assertGreaterThan(9)
    }
}

class MessageDetail extends Struct({
    agent: Agent,
    message: Field,
}) {
    
}

class Message extends Struct({
    messageNumber: Field,
    messageDetails: MessageDetail
}) {
    public isValid(): void {
        this.messageDetails.message.assertGreaterThan(99999999999)
        this.messageDetails.message.assertLessThan(1000000000000)
    }
}

@runtimeModule()
export class Messages extends RuntimeModule<unknown>{
    @state() private existingAgents = StateMap.from(Field, Agent);

    @runtimeMethod()
    public processMessage(message: Message): any {
        // Ensure The AgentID exists in the system
        const agent = message.messageDetails.agent;
        assert(this.existingAgents.get(agent.agentId).isSome);

        // The security code matches that held for that AgentID
        const messageSecurityCode = agent.securityCode;
        assert(this.existingAgents.get(agent.agentId).value.securityCode.equals(messageSecurityCode));


        
    }
}