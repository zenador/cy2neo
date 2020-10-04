#!/bin/bash

ansible-playbook --syntax-check update.yml -i hosts.yml &&
ansible-playbook $*             update.yml -i hosts.yml
