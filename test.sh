#!/bin/zsh

words=(1 2 "#aa")

fred="#aaa"
reply=($(echo COMP="$fred")) || return $?
echo $reply
reply=$(echo "${words[@]}") || return $?
echo $reply
    value=(COMP_CWORD="${(qq)cword}" \
                       COMP_LINE="${(qq)line}" \
                       COMP_POINT="${(qq)point}" \
                       {completer} completion -- "${(qq)words[@]}")
    echo $value
