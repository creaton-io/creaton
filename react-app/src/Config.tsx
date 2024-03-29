/* ****************** URI'S ****************** */

export const ARWEAVE_GATEWAY = process.env.REACT_APP_ARWEAVE_GATEWAY;
export const REPORT_URI = process.env.REACT_APP_REPORT_URI;
export const ARWEAVE_URI = process.env.REACT_APP_ARWEAVE_URI;
export const FAUCET_URI = process.env.REACT_APP_FAUCET_URI;

export const REENCRYPTION_URI = process.env.REACT_APP_REENCRYPTION_URI;





/* ****************** APOLLO GRAPH URI ****************** */

export const APOLLO_URI = process.env.REACT_APP_SUBGRAPH_URI;





/* ****************** BICONOMY ****************** */

export const BICONOMY_API = process.env.REACT_APP_BICONOMY_API;
export const GASLESS_BACKEND = process.env.REACT_APP_GASLESS_BACKEND;




/* ****************** TOKEN ADDRESSES ****************** */

export const REACTION_CONTRACT_ADDRESS = process.env.REACT_APP_REACTION_CONTRACT_ADDRESS;
export const REACTION_ERC20 = process.env.REACT_APP_REACTION_ERC20;
export const CREATE_TOKEN_ADDRESS = process.env.REACT_APP_CREATE_TOKEN_ADDRESS;

export const GOVERNANCE_SQUAD_TOKENS = {
  GOV: process.env.REACT_APP_GOVERNANCE_SQUAD_TOKENS_GOV,
  MKT: process.env.REACT_APP_GOVERNANCE_SQUAD_TOKENS_MKT,
  DEV: process.env.REACT_APP_GOVERNANCE_SQUAD_TOKENS_DEV,
};
export const VOTING_GRAPHQL_URI = process.env.REACT_APP_VOTING_GRAPHQL_URI;
export const CREATOR_VOTING_ADDRESS = process.env.REACT_APP_CREATOR_VOTING_ADDRESS;

export const USDC_TOKEN_ADDRESS = process.env.REACT_APP_USDC_TOKEN_ADDRESS;
export const DAI_TOKEN_ADDRESS = process.env.REACT_APP_DAI_TOKEN_ADDRESS;





/* ****************** FEATURE FLAGS ****************** */

/**
 * FEATURE FLAGS
 * We might need more logic
 */
let NFTLANCE_ENABLED = true;
let REACTION_TOKENS_ENABLED = true;
let MODERATION_ENABLED = false;
let CREATON_VOTING_ENABLED = false;
let CHAT_ENABLED = false;

let BICONOMY_SIGNUP_ENABLED = false;
let BICONOMY_UPLOAD_ENABLED = false;
let BICONOMY_REACTION_ENABLED = false;
let BICONOMY_NFTLANCE_ENABLED = false;
let BICONOMY_MODERATION_ENABLED = false;





/* ****************** EXPORT ****************** */

export {
  NFTLANCE_ENABLED,
  REACTION_TOKENS_ENABLED,
  CREATON_VOTING_ENABLED,
  MODERATION_ENABLED,
  CHAT_ENABLED,
  BICONOMY_SIGNUP_ENABLED,
  BICONOMY_UPLOAD_ENABLED,
  BICONOMY_REACTION_ENABLED,
  BICONOMY_NFTLANCE_ENABLED,
  BICONOMY_MODERATION_ENABLED
};
