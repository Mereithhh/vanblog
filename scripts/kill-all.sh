#!/bin/bash
netstat -nptl  | grep 3000 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
netstat -nptl  | grep 3001 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
netstat -nptl  | grep 3002 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
netstat -nptl  | grep 8360 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
