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

### Running hubot-agenda Locally

You can test your hubot by running the following, however some plugins will not
behave as expected unless the [environment variables](#configuration) they rely
upon have been set.

You can start hubot-agenda locally by running:


    % bin/hubot -n agenda   # -n <name> flag ensures that the name of the bot is 'agenda'

You'll see some start up output and a prompt:

    [Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
    agenda>

Then you can interact with hubot-agenda by typing `agenda help`.

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

A few scripts (including some installed by default) require environment
variables to be set as a simple form of configuration.

AgendaBot only requires that you set `HUBOT_SLACK_TOKEN` to the token given to you from Slack.

How to set environment variables will be specific to your operating system.
Rather than recreate the various methods and best practices in achieving this,
it's suggested that you search for a dedicated guide focused on your OS.

## Adapters

Adapters are the interface to the service you want your hubot to run on, such
as Campfire or IRC. There are a number of third party adapters that the
community have contributed. Check [Hubot Adapters][hubot-adapters] for the
available ones.

If you would like to run a non-Campfire or shell adapter you will need to add
the adapter package as a dependency to the `package.json` file in the
`dependencies` section.

Once you've added the dependency with `npm install --save` to install it you
can then run hubot with the adapter.

    % bin/hubot -a <adapter>

Where `<adapter>` is the name of your adapter without the `hubot-` prefix.

I cannot guarantee that AgendaBot will work with every adapter but it will work with the Slack
adapter for sure!

[hubot-adapters]: https://github.com/github/hubot/blob/master/docs/adapters.md

### Deploying to UNIX or Windows

If you would like to deploy to either a UNIX operating system or Windows.
Please check out the [deploying hubot onto UNIX][deploy-unix] and [deploying
hubot onto Windows][deploy-windows] wiki pages.

[deploy-unix]: https://github.com/github/hubot/blob/master/docs/deploying/unix.md
[deploy-windows]: https://github.com/github/hubot/blob/master/docs/deploying/windows.md
