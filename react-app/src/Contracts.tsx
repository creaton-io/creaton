import production_contracts from "./contracts-production.json";
import development_contracts from "./contracts-mumbai.json";

let creaton_contracts
if (process.env.NODE_ENV === 'development') {
  creaton_contracts = development_contracts
} else {
  creaton_contracts = production_contracts
}

export default creaton_contracts
