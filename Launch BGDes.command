#!/bin/bash
cd "$(dirname "$0")"
PORT=4000 npm run dev &
claude --dangerously-skip-permissions
