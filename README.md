## This Fork

The purpose of this fork is to expand bash aliases, allowing you to run commands like `gr @something gl` when you've got `alias gl='git pull'` in your profile. **Currently only works for bash.**

To install this fork: `npm install -g git+ssh://git@github.com:michaek/gr.git`

## Features

- Tag all the things! `gr @work foo` will run the command `foo` in all the paths tagged `@work`.
- Auto-discovery of git repositories for easy setup and tag management.
- `gr` does not reinvent any git operations: instead, it passes through and runs any unknown commands. All your git-fu will still work! e.g. `gr @work git fetch` is the same as running `git fetch` in each all the paths tagged `@work`.
- Built-in commands for common pain points:
  - `status` for one-line summaries of repos (modified, behind/ahead, tags)
- Extensible via plugins and middleware: REST API/[Connect](http://senchalabs.github.com/connect)-style request handlers (`function(req, res, next) { ... }`

-----

## Changelog

- `0.3.0`: Switched from `#foo` to `@foo` for tags; while the `#foo` syntax looks cool, most shells will treat it as a comment unless the tag is surrounded by quotes. Looking back at the design, I'd rather go for usability over pretty looking commands. Updated the documentation to match this change.

## Example

`gr` works by tagging directories with tags:

    gr +@work ~/mnt/gluejs ~/mnt/microee

After this, you can run any commands on the tagged directories simply by prefixing them with `gr @work`. For example:

    gr @work status

Outputs (actual output is colorized):

    ~/mnt/gluejs           2 modified [ahead 2]      @work
    ~/mnt/microee          Clean                     @work

E.g. path, modified, ahead/behind remote, tags. Alternatively, you can use plain git commands for a more verbose report:

    gr @work git status -sb

Outputs:

    in ~/mnt/gluejs

    ## glue2
     M lib/runner/package-commonjs/index.js
     M index.js

    in ~/mnt/microee

    ## master

`gr` doesn't do any command rewriting, or introduce any new commands - I like `git` as it is.

## Getting started

First, [install Node.js](http://nodejs.org/download/). Node.js adds the `node` and the `npm` command. On Ubuntu you need the `nodejs-legacy` package.

Next, to install `gr` (the name was already taken on npm):

    npm install -g git-run

You may need to prefix this with `sudo`. 

### Setting up tags
Use the auto-discovery feature to set up tags quickly:

    gr tag discover

Auto-discovery searches all paths under your home directory, generates a list, and opens it in your default console editor. 

It will look like this:

    # Found the following directories with `.git` directories.
    #
    # Please add any tags you want by adding one or more `@tag`
    # entries after the path name.
    # For example:
    #   ~/foo @work @play
    # will tag ~/foo with @work and @play.
    #
    ~/foo
    ~/bar/baz

Add tags after each path, save the file, and exit. 

Your tags are now set up!

Verify with `gr status` or `gr tag list`. Use `gr @work status` or `gr @work ls -lah` to see how commands are executed. (`status` is a built-in command; `ls -lah` is not, so it is run in each of the paths.)

You can run auto-discovery multiple times. It makes tag-related bulk changes  quite easy.

## Tab completion

To add tab completion:

- open your `~/.zshrc` or `~/.bashrc` (`~/.bash_profile` on OS X)
- add the line `. <(gr completion)` at the end of the file
- then, to apply this change to your current session, run `source ~/.zshrc` (or `source ~/.bashrc` or `source ~/bash_profile`)

Now, when you type `gr <tab>`, you'll see the list tags you've created. If you notice any bugs, let me know via an issue.

## How I use gr

Some examples:

COMMAND                                                         | TASK
-------                                                         | ----
`gr @work git fetch` and then `gr @work status`                 | Update all my work repos. This fetches the newest information from the remote, and then prints a one-line-at-a-time summary.
`gr @work git diff` or `gr @work git diff --cached`             | See diffs
`gr @work jshint . --exclude=**/node_modules`                   | Run `jshint`
`gr @write make`                                                | Rebuild all my writing via `make` 
`gr @work npm ls`                                               | List install npm modules
`gr @work git --no-pager log --decorate --graph --oneline -n 3` | Print a graph-like log


Of course, I don't actually type these out; I'm using `zsh` aliases instead. `grd` is for diff, `grdc` is for `diff --cached`; `grl` is for the log. For example, in `.zshrc`:

    alias grs="gr status"
    alias grl="gr git --no-pager log --decorate --graph --oneline -n 3"

You can set up similar aliases for `bash`; Google is your friend here.

## Usage

Usage:

    gr <options> <targets> <cmd>

## Options

Currently, there is just one option: `--json`, which switched to a machine-readable output and is used for integration tests.

## Targets

Targets can be *paths* or *tags*. For example:

    gr ~/foo ~/bar status
    gr @work ls -lah

- **Path** targets should be directories. 
- **Tags** refer to sets of directories. They managed using the `tag` built-in.

If you are using a scripting language that uses `#` for comments, you can also write tags as `-t foo`.

If no targets are given, then all tagged paths are used. For example, `gr status` will report the status of all repositories.

## Tagging

Short form:

    @tag            List directories associated with "tag"
    @tag <cmd>      Run a command in the directories associated with "tag"
    -t <tag> <cmd>  Run a command in the directories associated with "tag"
    +@tag           Add a tag to the current directory
    -@tag           Remove a tag from the current directory
    +@tag <path>    Add a tag to <path>
    -@tag <path>    Remove a tag from <path>

Long form:

    tag add <tag>   Alternative to +@tag
    tag rm <tag>    Alternative to -@tag
    tag add <t> <p> Alternative to +@tag <path>
    tag rm <t> <p>  Alternative to -@tag <path>
    tag list        List all tags (default action)
    tag discover    Auto-discover git paths under ~/

Example:

    gr +@work ~/bar

## Commands

The command can be either one of the built-in commands, or a shell command. For example:

    gr @work status
    gr ~/foo ~/bar ls -lah

To explicitly set the command, use `--`:

    gr ~/foo -- ~/bar.sh
    gr @work -- git remote -v

Tags can also be specified more explicitly. For example `gr -t work -t play` is the same as `gr @work @play`.

## Built-in commands:

    gr tag ..
      add <t>         Add a tag to the current directory
      rm <t>          Remove a tag from the current directory
      add <t> <path>  Add a tag to <path>
      rm <t> <path>   Remove a tag from <path>
      list            List all tags (default action)
      discover        Auto-discover git paths under ~/

    gr list        List all known repositories and their tags

    gr status       Displays the (git) status of the selected directories.
    gr status -v    Runs "git status -sb" for a more verbose status.

    gr config ..
      get <k>       Get a config key (can also be a path, e.g. "tags.foo")
      set <k> <v>   Set a config key (overwrites existing value)
      add <k> <v>   Add a value to a config key (appends rather than overwriting)
      rm <k> <v>    Remove a value from a config key (if it exists)
      list          List all configuration (default action)

    gr help        Show this help
    gr version     Version info

## Plugins

TODO: 

- [`bootstrap`](#TODO): bootstraps a set of repositories from a config file.

## Installing plugins

Generally speaking, you need to do two things:

1. install the plugin globally via npm: `npm install -g foo`
2. configure `gr` to use the plugin: `gr config add plugins foo`

The new commands should now be available.

## Writing plugins

Plugins are functions which are invoked once for each repository path specified by the user. This makes it easier to write plugins, since they do not need to handle executing against multiple repository paths explicitly.

Plugins are treated a bit like a REST API: they are defined as "routes" on the `gr` object.

Each plugin consists of an index file which is loaded when gr is started, and which should add new "routes":

    module.exports = function(gr) {
      // set up new commands on the gr object
      gr.use(['foo', 'help'], function(req, res, next) {
        console.log('Hello world');
        req.exit(); // stop processing
      });
      gr.use('foo', function(req, res, next) {
        console.log(req.argv, req.path);
        req.done(); // can be called multiple times
      });
    };

Of course, `req` and `res` in the handlers are not HTTP requests, but rather objects representing the target directory (a regular object) and `process.stdout`.

Each "route" is called multiple times, each with one path. Thus, assuming `@work` matches two paths, `gr @work status` is translated into multiple indvidual function calls; one for each directory/repository tagged `@work`.

      status({ path: '/home/m/foo', argv: ... }, process.stdout, next);
      status({ path: '/home/m/bar', argv: ... }, process.stdout, next);

There are three ways to stop processing:

1. Call `res.done()`. This means that the command should be called again for the next path. This is useful for processing commands that target directories.
2. Call `res.exit()`. This means that the command is complete, and `gr` should exit. For example, we don't want to show a help text multiple times if the user calls `gr @work help`.
3. Call `next`. This means that the current handler does not want to handle the current request. Similar to how Connect works, this is mostly used for writing middleware or falling back on a different action.

The `req` object describes the current request.

- `req.argv`: the command line arguments passed to the command, excluding ones that have already matched. For example: given `app.use(['foo', 'add'], ...)` and `gr foo add bar`, `argv = [ 'bar' ]`.
- `req.config`: the configuration object used by `gr`; allows you to read and write configuration values (see the code for details).
- `req.path`: the full path to the repository directory for this call
- `req.gr`: the instance of `gr` (see `index.js`)
- `req.format`: The desired output format, either `human` or `json`.

The `res` object controls

- `res.done`: Call this function when you have completed processing the task.

The `next` function is used if you decide not to handle the current request. Calling `next` will make the next matching request handler run. If you encounter an error, call `next(err)` to output the error.

## Writing middleware

Middleware are functions that extract additional metadata.

- `req.git.remotes`: TODO - a hash of remotes (for example: `{ origin: 'git...'}`). Extracted via the git middleware.

## A list of plugin ideas

Here are some plugin ideas:

- extend auto-discovery beyond git
- run tests
- run jshint / gjslint (only modified?)
- do npm / `package.json` linting
- generate docs
- fetch and report status as one action
- report `npm` versions (and whether the version of the package on npm is up to date)
- generate a changelog (between tagged versions)
- check that npm modules are up to date
- run `npm link` on all modules
- generate a list of authors
- generate a list of licences
- `xargs` compatibility
- Ability to confirm each command (to make it possible to skip)
- Ability expose other statuses (e.g., `npm outdated`)

## Make your plugin searchable

If you write a plugin, make sure to add the `gr` keyword to (in [`package.json`](https://npmjs.org/doc/json.html#keywords)). This makes it easy to find plugins by [searching `npm` by tag](https://npmjs.org/browse/keyword/gr). 

Also, file a PR against this README if you want to have your plugin listed here.

## Status matching idea

(This is just a random idea) Using "meta-tags" to target commands based on `git ls-files`.

- `clean`: Clean working directory - in other words, no tracked files are modified; no untracked files exist.
- `untracked`: Has files that are not tracked (but that have not been added to tracking)
- `modified`: Has files that are tracked and modified (but that have not been staged)
- `deleted`: Has files that are tracked and deleted
- staged: Has files that are staged for commit (but that have not been committed)
- `unmerged`: Has files that have not been merged
- `unclean`: Does not have a clean working directory.

For example: `gr @clean git fetch`

## Inspired by

- http://manpages.ubuntu.com/manpages/jaunty/man1/mr.1.html
- https://github.com/fabioz/mu-repo
- http://source.android.com/source/developing.html
