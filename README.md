# Tapster Viewport Server

Web-based controller for a Tapster mobile device automation robot

## Install Dependencies

### Install NVM

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

Exit terminal & relaunch to get new settings...

List available versions:

    nvm ls-remote

### Install latest long-term supported version of Node

(As of April 2023)

    nvm install 18.16.0
    
## Install Viewport Server

    git clone https://github.com/tapsterbot/viewport-server.git
    cd viewport-server/server
    npm install

## Edit Environment Variables

    vim config/env-vars.sh
    
    export NODE_ENV=development
    #export NODE_ENV=staging
    export SESSION_SECRET=super-secret  # CHANGEME
    export TVP_ACCESS_ID=tapster        # CHANGEME
    export TVP_ACCESS_PASSCODE=tapster  # CHANGEME
    
## Run Viewport Server

    source config/env-vars.sh
    npm start 
