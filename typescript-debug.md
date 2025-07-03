# TypeScript and ESLint debug output

## `yarn tsc --noEmit`

```
yarn run v1.22.22
$ /workspace/itext/node_modules/.bin/tsc --noEmit
Done in 6.33s.
```

## `yarn lint`

```
yarn run v1.22.22
$ next lint

./app/admin/dashboard/page.tsx
33:11  Error: 'entry' is assigned a value but never used.  @typescript-eslint/no-unused-vars
44:48  Error: 'userError' is never reassigned. Use 'const' instead.  prefer-const
99:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
107:6  Warning: React Hook useEffect has a missing dependency: 'loadConversations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
121:6  Warning: React Hook useEffect has missing dependencies: 'conversations.length', 'loadConversations', and 'loading'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
222:9  Error: 'handleSendMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
...
info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
error Command failed with exit code 1.
```

The lint step failed with multiple errors. See `lint_output_full.log` for the
full list.

