# AgendaBot

AgendaBot is a chat bot built on the [Hubot][hubot] framework.

[hubot]: http://hubot.github.com
### Commands
    agenda add <item> - Adds <item> to the agenda
    agenda rm/rem/remove <item> - Removes <item> from the agenda
    agenda update <id> <new text> - Updates <id> with <new text>
    agenda assign <id> <assignee> - Assign an item to <assignee>
    agenda unassign <id> - Unassign an item
    agenda set importance <id> <level> - Set the importance/color of an item. <level> = 'high', 'medium', 'low', or 'default'.
    agenda li/ls/list - List the agenda
    agenda set schedule - Update the schedule
    agenda up/uptime - Get the bot's uptime
    agenda v/-v/version - Get the bot's version

*For the most up to date list of commands, please use `agenda help`.*

### Running as a Slackbot on Linux

  First go to your Slack workspace and add app. Search for "bots" and install the official bots app. Name it "agenda" and save.

  Install coffeescript on your server with:
  ```bash
  npm install coffeescript -g
  ```

  Next, create the following file inside of the `bin` directory.

  `bin/hubotslack`:
  ```bash
  #!/bin/bash

  export HUBOT_SLACK_TOKEN=xoxb-YOUR_TOKEN_HERE

  npm install

  forever start -l /home/SOMEWHERE/agendabot.log -a -c coffee node_modules/.bin/hubot --adapter slack --name agenda

  # Uncomment the line below to turn on the web view
  # forever start -l /home/SOMEWHERE/agendabot-web.log -a -c node web.js
  ```

  Replace `xoxb-YOUR_TOKEN_HERE` with the token from Slack.
  Replace `SOMEWHERE` with a path to your log file (if you don't know what to put here, create a directory: `/home/user/logs` and store it there)

  Make it executable (`chmod +x bin/hubotslack`)
  And run it: `bin/hubotslack`

### Running Locally

You can start AgendaBot locally by running:

    % bin/hubot

You'll see some start up output and a prompt:

    [Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
    agenda>

Then you can interact with AgendaBot by typing `agenda help`.

    agenda> agenda help
    agenda adapter - Reply with the adapter
    agenda add <item> - Adds <item> to the agenda
    agenda echo <text> - Reply back with <text>
    agenda help - Displays all of the help commands that this bot knows about.
    agenda help <query> - Displays all help commands that match <query>.
    agenda li/list - List the agenda
    agenda ping - Reply with pong
    agenda rm/rem/remove <item> - Removes <item> from the agenda
    agenda schedule - Update the schedule
    agenda time - Reply with current time

### Configuration

AgendaBot only requires that you set `HUBOT_SLACK_TOKEN` env var to the token given to you from Slack.

How to set environment variables will be specific to your operating system.
Rather than recreate the various methods and best practices in achieving this,
it's suggested that you search for a dedicated guide focused on your OS.

