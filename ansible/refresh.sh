#!/bin/bash

ansible-playbook --syntax-check refresh.yml -i hosts.yml &&
ansible-playbook $*             refresh.yml -i hosts.yml
