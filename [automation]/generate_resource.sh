#!/bin/bash
[ -d "../[armoury-boilerplate]" ] && echo 'Please remove the boilerplate resource first!' && read closeup && exit N
echo "What will the name of your new resource be?"
read resourcename
[ -d "../${resourcename}" ] && echo 'That resource already exists!' && read closeup && exit N
unzip "defaults/[armoury-boilerplate].zip" -d "../"
mv ../[armoury-boilerplate] "../${resourcename}" && echo $'\n\nInstalling prerequisites..\n\n'
cd "../${resourcename}" && npm install && npm run build && yarn import
echo $'\nYour resource has been successfully created! Press any key to continue..' && read closeup
