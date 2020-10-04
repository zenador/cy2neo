#!/bin/bash

ansible-playbook --syntax-check setup.yml -i hosts.yml &&
ansible-playbook $*             setup.yml -i hosts.yml
#ansible-playbook --syntax-check config.yml -i hosts.yml --ask-become-pass &&
#ansible-playbook $*             config.yml -i hosts.yml --ask-become-pass
