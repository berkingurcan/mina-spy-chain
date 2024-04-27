import { Balance } from "@proto-kit/library";
import { Balances } from "./balances";
import { Messages } from "./messages";
import { PrivateMessages } from "./privateMessages";
import { ModulesConfig } from "@proto-kit/common";

export const modules = {
  Balances,
  Messages,
  PrivateMessages
};

export const config: ModulesConfig<typeof modules> = {
  Balances: {
    totalSupply: Balance.from(10_000),
  },
  Messages: {},
  PrivateMessages: {}
};

export default {
  modules,
  config,
};
