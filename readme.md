# gr

`gr` is a tool for managing multiple git repositories.

## Features

- Hashtag all the things! `gr #work foo` will run the command `foo` in all the paths tagged #work.
- Auto-discovery of git repositories for easy setup and tag management.
- `gr` does not reinvent any git operations: instead, it passes through and runs any unknown commands. All your git-fu will still work! e.g. `gr #work git fetch` is the same as running `git fetch` in each all the paths tagged #work.
- Built-in commands for common pain points:
  - `status` for one-line summaries of repos (modified, behind/ahead, tags)
  - `bootstrap` for fetching repos
- Extensible via plugins and middleware: REST API/[Connect](http://senchalabs.github.com/connect)-style request handlers (`function(req, res, next) { ... }`

## Example

`gr` works by tagging directories with tags:

    gr +#work ~/mnt/gluejs ~/mnt/microee

After this, you can run any commands on the tagged directories simply by prefixing them with `gr #work`. For example:

    gr #work git status -sb

Outputs:

    in ~/mnt/gluejs

    ## glue2
     M lib/runner/package-commonjs/index.js

    in ~/mnt/microee

    ## master

`gr` doesn't do any command rewriting, or introduce any new commands - I like `git` as it is.

Usage: gr <targets> <cmd>

## Targets

The targets can be paths or tags. For example:

    gr ~/foo ~/bar status
    gr #work ls -lah

Path targets be directories. Tags refer to sets of directories. They managed using the `tag` built-in.

## Tagging

    #tag            List directories associated with "tag"
    #tag <cmd>      Run a command in the directories associated with "tag"
    -t <tag> <cmd>  Run a command in the directories associated with "tag"
    +#tag           Add a tag to the current directory
    -#tag           Remove a tag from the current directory
    +#tag <path>    Add a tag to <path>
    -#tag <path>    Remove a tag from <path>

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

    gr list        List all known repositories and their tags

    gr tag ..
      add <t>         Add a tag to the current directory
      rm <t>          Remove a tag from the current directory
      add <t> <path>  Add a tag to <path>
      rm <t> <path>   Remove a tag from <path>
      list            List all tags (default action)

    gr status    Displays the (git) status of the directory.

    gr config ..
      get <k>       Get a config key (can also be a path, e.g. "tags.foo")
      set <k> <v>   Set a config key (overwrites existing value)
      add <k> <v>   Add a value to a config key (appends rather than overwriting)
      rm <k> <v>    Remove a value from a config key (if it exists)
      list          List all configuration (default action)

    gr help        Show this help
    gr version     Version info


## Todo

- gr bootstrap url
- filter plugins

## Installation

Sadly, the name "gr" was already taken on npm. To install gr:

    npm install -g git-run

which was the original name.


## Aliases

Useful aliases:

    alias grs="gr git --no-pager status -sb"
    alias grl="gr git --no-pager log --decorate --graph --oneline -n 3"
    alias grd="gr git diff"
    alias grdc="gr git diff --cached"
    alias grn="gr npm ls"

## Inspired by

- http://manpages.ubuntu.com/manpages/jaunty/man1/mr.1.html
- https://github.com/fabioz/mu-repo
- http://source.android.com/source/developing.html
