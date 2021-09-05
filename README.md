# denotree

> [Deno で CLI ツールを作ってみる：tree コマンドの実装](https://zenn.dev/kawarimidoll/articles/0f5bc71ae633f3)

## Installation

```sh
deno install --allow-read --name denotree https://raw.githubusercontent.com/mitani24/denotree/main/tree.ts
```

## Usage

```sh
denotree
  'tree' powered by Deno

  USAGE
    denotree [dirname] : Show children of dirname. default dirname is pwd.

  OPTIONS
    a     : Show dotfiles
    d     : Show only directories
    L=num : Limit depth
    h     : Show this help message
```
