## Features

- Hashtag all the things! `gr #work foo` will run the command `foo` in all the paths tagged #work.
- Auto-discovery of git repositories for easy setup and tag management.
- `gr` does not reinvent any git operations: instead, it passes through and runs any unknown commands. All your git-fu will still work! e.g. `gr #work git fetch` is the same as running `git fetch` in each all the paths tagged #work.
- Built-in commands for common pain points:
  - `status` for one-line summaries of repos (modified, behind/ahead, tags)
  - `bootstrap` for fetching repos
- Extensible via plugins and middleware: REST API/[Connect](http://senchalabs.github.com/connect)-style request handlers (`function(req, res, next) { ... }`

-----

## Example

`gr` works by tagging directories with tags:

    gr +#work ~/mnt/gluejs ~/mnt/microee

After this, you can run any commands on the tagged directories simply by prefixing them with `gr #work`. For example:

    gr #work git status -sb

Outputs (actual output is colorized):

    in ~/mnt/gluejs

    ## glue2
     M lib/runner/package-commonjs/index.js

    in ~/mnt/microee

    ## master

`gr` doesn't do any command rewriting, or introduce any new commands - I like `git` as it is.

## Getting started

To install gr (the name was already taken on npm):

    npm install -g git-run

Use the auto-discovery feature to set up tags quickly:

    gr tag discover

This searches all paths under your home path; generates a list and opens the list in your default console editor. This file will look like this:

    # Found the following directories with `.git` directories.
    #
    # Please add any tags you want by adding one or more `#tag`
    # entries after the path name.
    # For example:
    #   ~/foo #work #play
    # will tag ~/foo with #work and #play.
    #
    ~/foo
    ~/bar/baz

Add tags after each path, save the file and exit. Now, your tags are set up.

Run `gr status` or `gr tag list` to verify; and try `gr #work status` or `gr #work ls -lah` to see how commands are executed. `status` is a built-in command; `ls -lah` is not so it is run in each of the paths.

## How I use gr

I have a couple of common basic use cases:

- to update all my work repos: `gr #work git fetch` and then `gr #work status`. This fetches the newest information from the remote, and then prints a one-line-at-a-time summary.
- to see the diffs: `gr #work git diff` or `gr #work git diff --cached`
- to see the npm modules installed in the repos: `gr #work npm ls`
- to print a graph-like log: `gr #work git --no-pager log --decorate --graph --oneline -n 3`

Of course, I don't actually type these out. Instead, I am using `zsh` aliases. `grd` is for diff, `grdc` is for diff --cached; `grl` is for the log. For example, in `.zshrc`:

    alias grl="gr git --no-pager log --decorate --graph --oneline -n 3"

You can set up similar aliases for `bash`; Google is your friend here.

## Usage

Usage:

    gr <options> <targets> <cmd>

## Options

Currently, there is just one option: `--json`, which switched to a machine-readable output and is used for integration tests.

## Targets

The targets can be paths or tags. For example:

    gr ~/foo ~/bar status
    gr #work ls -lah

Path targets be directories. Tags refer to sets of directories. They managed using the `tag` built-in.

If you are using a scripting language that uses `#` for comments, you can also write tags as `-t foo`.

If no targets are given, then all tagged paths are used. For example, `gr status` will report the status of all repositories.

## Tagging

Short form:

    #tag            List directories associated with "tag"
    #tag <cmd>      Run a command in the directories associated with "tag"
    -t <tag> <cmd>  Run a command in the directories associated with "tag"
    +#tag           Add a tag to the current directory
    -#tag           Remove a tag from the current directory
    +#tag <path>    Add a tag to <path>
    -#tag <path>    Remove a tag from <path>

Long form:

    tag add <tag>   Alternative to +#tag
    tag rm <tag>    Alternative to -#tag
    tag add <t> <p> Alternative to +#tag <path>
    tag rm <t> <p>  Alternative to -#tag <path>
    tag list        List all tags (default action)
    tag discover    Auto-discover git paths under ~/

For example:

    gr +#work ~/bar

## Commands

The command can be either one of the built-in commands, or a shell command. For example:

    gr #work status
    gr ~/foo ~/bar ls -lah

To explicitly set the command, use `--`:

    gr ~/foo -- ~/bar.sh
    gr #work -- git remote -v

Tags can also be specified more explicitly; this is useful if you are using a scripting language which uses # for comments. For example `gr -t work -t play` is the same as `gr #work #play`.

## Built-in commands:

    gr tag ..
      add <t>         Add a tag to the current directory
      rm <t>          Remove a tag from the current directory
      add <t> <path>  Add a tag to <path>
      rm <t> <path>   Remove a tag from <path>
      list            List all tags (default action)
      discover        Auto-discover git paths under ~/

    gr list        List all known repositories and their tags

    gr status      Displays the (git) status of the selected directories.

    gr config ..
      get <k>       Get a config key (can also be a path, e.g. "tags.foo")
      set <k> <v>   Set a config key (overwrites existing value)
      add <k> <v>   Add a value to a config key (appends rather than overwriting)
      rm <k> <v>    Remove a value from a config key (if it exists)
      list          List all configuration (default action)

    gr help        Show this help
    gr version     Version info

## Writing plugins

Plugins are functions which are invoked once for each repository path specified by the user. This makes it easier to write plugins, since they do not need to handle executing against multiple repository paths explicitly.

If you write a plugin, make sure to tag it (in `package.json`) with `gr`. This makes it easy to find plugins by [searching npm by tag](#TODO). Also, file a PR against this readme if you want to have your plugin listed here.

Here are the plugins that are currently available:

- [bootstrap](#TODO): bootstraps a set of repositories from a config file.

Here is a list of plugin ideas:

- extend auto-discovery beyond git
- run tests
- run jshint / gjslint (only modified?)
- do npm / package.json linting
- generate docs
- fetch and report status as one action
- report npm versions (and whether the version of the package on npm is up to date)
- generate a changelog (between tagged versions)
- check that npm modules are up to date
- run npm link on all modules
- generate a list of authors
- generate a list of licences
- xargs -compatibility
- Ability to confirm each command (to make it possible to skip)
- Ability expose other statuses, e.g. npm outdated


Plugins are treated a bit like a REST API: they are defined as "routes" on the `gr` object.

    app.use('status', function(req, res, next) {
      // ...
    });

Of course, req and res are not HTTP requests, but rather objects representing the target directory (a regular object) and process.stdout.

Here's one way to think about this: each command, such as `gr #work status` is translated into multiple indvidual function calls; one for each directory/repository tagged `#work`.

    gr #work status
      \-> status({ path: '/home/m/foo', argv: ... }, process.stdout, next)
       -> status({ path: '/home/m/bar', argv: ... }, process.stdout, next)

`req` properties:

- `req.argv`: the command line arguments passed to the command, excluding ones that have already matched. For example: given `app.use(['foo', 'add'], ...)` and `gr foo add bar`, `argv = [ 'bar' ]`.
- `req.done`: Call this function when you have completed processing the task.
- `req.config`: the configuration object used by `gr`; allows you to read and write configuration values (see the code for details).
- `req.path`: the full path to the repository directory for this call
- `req.gr`: the instance of `gr` (see `index.js`)
- `req.format`: The desired output format, either `human` or `json`.
- `req.git.remotes`: TODO - a hash of remotes (for example: `{ origin: 'git...'}`). Extracted via the git middleware.

## Status matching idea

This is just a random idea - using "meta-tags" to target commands based on `git ls-files`.

- clean: Clean working directory - in other words, no tracked files are modified; no untracked files exist.
- untracked: Has files that are not tracked (but that have not been added to tracking)
- modified: Has files that are tracked and modified (but that have not been staged)
- deleted: Has files that are tracked and deleted
- staged: Has files that are staged for commit (but that have not been committed)
- unmerged: Has files that have not been merged
- unclean: Does not have a clean working directory.

For example: `gr #clean git fetch`

## Inspired by

- http://manpages.ubuntu.com/manpages/jaunty/man1/mr.1.html
- https://github.com/fabioz/mu-repo
- http://source.android.com/source/developing.html
