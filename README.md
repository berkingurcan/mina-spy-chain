# MINA NAVIGATORS L2E CHALLENGE 3

This repository is a solution for Mina Navigators program, learn to earn challenge 3.

## Answer to the question regarding privacy
This app chain is not private regarding messages, agents and their contents because all inputs and states are public. It is roughly solved by encrypting and decrypting by content and secret codes BUT it is not tricky and also we need verification of the messages. So, it is solved by benefiting zk programs, messages should go through verifiable computation on to ensure their privacy and only the proof of this computation should be transferred. By using this technique, all existing message constraints can be confirmed, and without disclosing any sensitive information, the system's state can be updated as necessary. Then we can change the application messages and their verification are private.

 
## Quick start

The monorepo contains 1 package and 1 app:

- `packages/chain` contains everything related to your app-chain
- `apps/web` contains a demo UI that connects to your locally hosted app-chain sequencer

**Prerequisites:**

- Node.js v18
- pnpm
- nvm

> If you're on windows, please use Docker until we find a more suitable solution to running the `@proto-kit/cli`. 
> Run the following command and then proceed to "Running the sequencer & UI":
>
> `docker run -it --rm -p 3000:3000 -p 8080:8080 -v %cd%:/starter-kit -w /starter-kit gplane/pnpm:node18 bash`


### Running tests
```zsh
# run and watch tests for the `chain` package
pnpm run test
```
