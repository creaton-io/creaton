#!/usr/bin/env python3

import json
import re
from pathlib import Path

from PyInquirer import prompt, Separator
import os


def run_command(command):
    os.system(command)

def update_contracts_mumbai():
    BASE_PATH = Path('contracts/deployments')
    #networks = list(os.listdir(BASE_PATH))
    #network = prompt([
    #    {
    #        'type': 'list',
    #        'name': 'network',
    #        'message': 'Which network?',
    #        'choices': networks
    #    },
    #])['network']
    network = 'mumbai'
    creaton_admin = json.load(open(BASE_PATH / network / 'CreatonAdmin.json'))
    creaton_admin['address'] = prompt([
        {
            'type': 'input',
            'name': 'address',
            'message': "Hardhat deployment files doesn't include the proxy address. Enter it manually:",
        },
    ])['address']
    creator = json.load(open(BASE_PATH / network / 'CreatorV1.json'))
    #twitter = json.load(open(BASE_PATH / network / 'TwitterVerification.json'))
    paymaster = json.load(open(BASE_PATH / network / 'CreatonPaymaster.json'))
    #staking = json.load(open(BASE_PATH / network / 'MetatxStaking.json'))
    #token = json.load(open(BASE_PATH / network / 'CreatonToken.json'))
    contracts_info = {'network': network, 'CreatonAdmin': creaton_admin, 'Creator': creator,
                      #'TwitterVerification': twitter,
                      'Paymaster': paymaster
                      #'CreatonStaking': staking,
                      #'CreatonToken': token
                      }
    for name, contract in contracts_info.items():
        if name == 'network':
            continue
        contracts_info[name] = {'abi': contract['abi'], 'address': contract['address']}  # remove all extra info
    REACT_CONTRACT_PATH = Path('react-app/src/contracts-mumbai.json')
    json.dump(contracts_info, open(REACT_CONTRACT_PATH, 'w'), indent=2)
    print(f'Updated {REACT_CONTRACT_PATH}')
    update_subgraph(creaton_admin, creator, network)

def update_contracts():
    BASE_PATH = Path('contracts/deployments')
    #networks = list(os.listdir(BASE_PATH))
    #network = prompt([
    #    {
    #        'type': 'list',
    #        'name': 'network',
    #        'message': 'Which network?',
    #        'choices': networks
    #    },
    #])['network']
    network = 'mumbai'
    creaton_admin = json.load(open(BASE_PATH / network / 'CreatonAdmin.json'))
    creaton_admin['address'] = prompt([
        {
            'type': 'input',
            'name': 'address',
            'message': "Hardhat deployment files doesn't include the proxy address. Enter it manually:",
        },
    ])['address']
    creator = json.load(open(BASE_PATH / network / 'CreatorV1.json'))
    #twitter = json.load(open(BASE_PATH / network / 'TwitterVerification.json'))
    paymaster = json.load(open(BASE_PATH / network / 'CreatonPaymaster.json'))
    #staking = json.load(open(BASE_PATH / network / 'MetatxStaking.json'))
    #token = json.load(open(BASE_PATH / network / 'CreatonToken.json'))
    contracts_info = {'network': network, 'CreatonAdmin': creaton_admin, 'Creator': creator,
                      #'TwitterVerification': twitter,
                      'Paymaster': paymaster
                      #'CreatonStaking': staking,
                      #'CreatonToken': token
                      }
    for name, contract in contracts_info.items():
        if name == 'network':
            continue
        contracts_info[name] = {'abi': contract['abi'], 'address': contract['address']}  # remove all extra info
    REACT_CONTRACT_PATH = Path('react-app/src/contracts.json')
    json.dump(contracts_info, open(REACT_CONTRACT_PATH, 'w'), indent=2)
    print(f'Updated {REACT_CONTRACT_PATH}')
    update_subgraph(creaton_admin, creator, network)


def yesno(question):
    return prompt([
        {
            'type': 'list',
            'name': 'yesno',
            'message': question,
            'choices': [
                'Yes please',
                'No thanks',
            ]
        },
    ])['yesno'] == 'Yes please'


def update_subgraph(creaton_admin, creator, network):
    SUBGRAPH_ABI_PATH = Path('subgraph/abis')
    json.dump(creator['abi'], open(SUBGRAPH_ABI_PATH / 'Creator.json', 'w'), indent=2)
    print(f"Updated {SUBGRAPH_ABI_PATH / 'Creator.json'}")
    json.dump(creaton_admin['abi'], open(SUBGRAPH_ABI_PATH / 'CreatonAdmin.json', 'w'), indent=2)
    print(f"Updated {SUBGRAPH_ABI_PATH / 'CreatonAdmin.json'}")
    converted_lines = []
    yaml_path = 'subgraph/subgraph.yaml'
    for line in open(yaml_path).readlines():
        if 'network:' in line:
            if network not in line:
                print(f'Subgraph yaml config is for {line.strip()} but this configuration is for network {network}'
                      f'Refusing to update the subgraph')
                return
        if '#CreatonAdminAddress' in line:
            # Replacing the address
            line = re.sub(r'0x[^"]+', creaton_admin['address'], line)
        converted_lines.append(line)
    with open(yaml_path, 'w') as f:
        f.write(''.join(converted_lines))
    print(f'Updated {yaml_path}')

    if yesno('Redeploy the contracts locally?'):
        run_command('cd subgraph && npm run deploy-local')


def deploy_contracts_mumbai():
    run_command('npm run mumbai:contracts')
    if yesno('Update the contract addresses in subgraph and react?'):
        return update_contracts_mumbai()

def deploy_contracts():
    run_command('npm run matic:contracts')
    if yesno('Update the contract addresses in subgraph and react?'):
        return update_contracts()


def main():
    question = [
        {
            'type': 'list',
            'name': 'subproject',
            'message': 'What do you want to do?',
            'choices': [
                'contracts',
                'subgraph',
                'react-app',
                Separator(),
                'deploy contracts',
                'deploy contracts mumbai testnet',
                'update contracts',
                'update contracts mumbai testnet',
                'run subgraph docker',
                'run re-encryption server',
            ]
        },
    ]

    subproject = prompt(question)['subproject']
    if subproject == 'deploy contracts mumbai testnet':
        return deploy_contracts_mumbai()

    if subproject == 'deploy contracts':
        return deploy_contracts()

    if subproject == 'update contracts':
        return update_contracts()

    if subproject == 'update contracts mumbai testnet':
        return update_contracts_mumbai()

    if subproject == 'run subgraph docker':
        run_command('cd subgraph && docker-compose up')
        return

    if subproject == 'run re-encryption server':
        run_command('cd umbral-server && docker-compose up')
        return

    json_config = json.load(open(Path(subproject) / 'package.json'))
    scripts = json_config['scripts']
    choices = [{'name': f'{command} -> {description}', 'value': command} for command, description in scripts.items()]
    command_question = [
        {
            'type': 'list',
            'name': 'command',
            'message': f'Which npm run command  in {subproject}?',
            'choices': choices
        },
    ]
    command = prompt(command_question)['command']
    run_command(f'cd {subproject} && npm run {command}')


if __name__ == '__main__':
    main()
