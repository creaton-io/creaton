#!/usr/bin/env python3

import json
from pathlib import Path

from PyInquirer import prompt, Separator
import os


def run_command(command):
    os.system(command)


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
                'run subgraph docker',
            ]
        },
    ]

    subproject = prompt(question)['subproject']
    if subproject == 'run subgraph docker':
        run_command('cd subgraph && docker-compose up')
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
