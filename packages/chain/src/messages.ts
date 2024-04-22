import { runtimeModule, state, runtimeMethod, Runtime, RuntimeModule } from "@proto-kit/module";
import { State, assert } from "@proto-kit/protocol";
import { Bool, Field, Struct } from "o1js";

class Agent extends Struct({
    agentId: Field,
    securityCode: Field
}) {
    static createAgent(agentId: Field, securityCode: Field): Agent {
        return new Agent({
            agentId: Field(agentId),
            securityCode: Field(securityCode)
        });
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

}

@runtimeModule()
export class Messages extends RuntimeModule<unknown>{
    @state() public messageNumber = State.from()
}