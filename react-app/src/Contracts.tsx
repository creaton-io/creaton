import production_contracts from './contracts.json';
import staging_contracts from './contracts-staging-mumbai.json';
import development_contracts from './contracts-dev-mumbai.json';

let creaton_contracts;
if (process.env.NODE_ENV === 'development') {
  creaton_contracts = development_contracts;
  //@ts-ignore
} else if (process.env.NODE_ENV === 'staging') {
  creaton_contracts = staging_contracts;
} else if (process.env.NODE_ENV === 'production') {
  creaton_contracts = production_contracts;
}

export default creaton_contracts;
