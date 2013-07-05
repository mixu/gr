# gr

Multiple git repository management tool

`gr` is a command line tool that allows you to manage multiple git repositories by prefixing your commands with `gr`.

For example:

    gr git log -1

Returns the following:

    in /home/m/mnt/gluejs

    commit 12b46164c5a0e930f9bc89ecd45728b38dd4fa74
    Author: Mikito Takada <mikito.takada@gmail.com>
    Date:   Wed Jun 26 03:19:52 2013 +0000

        2.0.2

    in /home/m/mnt/gr

    commit 0791027e594e6bf6818a9a9af07d33f1d62c5a44
    Author: Mikito Takada <mikito.takada@gmail.com>
    Date:   Tue Jul 4 18:45:46 2013 -0700

        Initial import

Commands prefixed with `gr` will be run in every directory under `~` that has a `.git` directory inside it.

It doesn't do any command rewriting, or introduce any new commands - I like `git` as it is.

## Todo

- gr ls / gr list
- gr help
- gr bootstrap url
- gr group
- filter plugins
- gr -- ~/mnt/* style path expressions

## Installation

Sadly, the name "gr" was already taken on npm. To install gr:

    npm install -g git-run

which was the original name.


## Aliases

`gr` is a replacement for the following zsh function:

    gr() {
     local cmd="$*"
     for dir in /home/{a,b,c}; do
      (
       print "\nin $dir"
       cd $dir
       eval "$cmd"
      )
     done
    }

It has the added benefit of finding new git repositories rather than requiring maintenance.

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
