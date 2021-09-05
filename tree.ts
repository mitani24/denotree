import { join, resolve } from "https://deno.land/std@0.106.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.106.0/flags/mod.ts";

export interface TreeOptions {
  maxDepth?: number;
  includeFiles?: boolean;
  skip?: RegExp[];
}

export interface TreeEntry extends Deno.DirEntry {
  path: string;
}

const {
  a,
  d,
  L,
  h,
  _: [dir = "."],
} = parse(Deno.args);

const printHelp = () => {
  const msg = `denotree
  'tree' powered by Deno

  USAGE
    denotree [dirname] : Show children of dirname. default dirname is pwd.

  OPTIONS
    a     : Show dotfiles
    d     : Show only directories
    L=num : Limit depth
    h     : Show this help message
  `;
  console.log(msg);
  Deno.exit(0);
};

const options: TreeOptions = {
  maxDepth: L,
  includeFiles: !d,
  skip: a ? [] : undefined,
};

const defaultOptions: TreeOptions = {
  maxDepth: Infinity,
  includeFiles: true,
  skip: [/(^|\/)\./],
};

const include = (path: string, skip?: RegExp[]) => {
  if (skip && skip.some((p) => !!path.match(p))) {
    return false;
  }
  return true;
};

const readDirEntries = async (root: string, options: TreeOptions) => {
  const { skip, includeFiles } = options;
  const entries: TreeEntry[] = [];

  for await (const entry of Deno.readDir(root)) {
    const treeEntry = {
      ...entry,
      path: join(root, entry.name),
    };
    entries.push(treeEntry);
  }

  return entries
    .filter((entry) => include(entry.path, skip))
    .filter((entry) => entry.isDirectory || includeFiles)
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
};

const printEntries = async (
  entries: TreeEntry[],
  prefix: string,
  options: TreeOptions
) => {
  const { maxDepth } = options;

  for await (const [index, entry] of entries.entries()) {
    const isLastEntry = index === entries.length - 1;
    const branch = isLastEntry ? "└── " : "├── ";
    const indent = isLastEntry ? "  " : "│  ";
    const suffix = entry.isDirectory ? "/" : "";

    console.log(prefix + branch + entry.name + suffix);

    if (entry.isDirectory) {
      await tree(entry.path, prefix + indent, {
        ...options,
        maxDepth: maxDepth != null ? maxDepth - 1 : maxDepth,
      });
    }
  }
};

const tree = async (root: string, prefix = "", options: TreeOptions = {}) => {
  const _options: TreeOptions = {
    maxDepth: options.maxDepth ?? defaultOptions.maxDepth,
    includeFiles: options.includeFiles ?? defaultOptions.includeFiles,
    skip: options.skip ?? defaultOptions.skip,
  };

  if (_options.maxDepth != null && _options.maxDepth < 1) return;

  const entries = await readDirEntries(root, _options);
  await printEntries(entries, prefix, _options);
};

if (h) printHelp();
await tree(resolve(Deno.cwd(), String(dir)), undefined, options);
