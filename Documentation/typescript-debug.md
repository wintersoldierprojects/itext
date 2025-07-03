# 🛠 TypeScript Debugging Cheatsheet

Quick reference for installing dependencies and running strict type checks.

**See Also**:
- [Technical Setup](./Technical-Reference/TECHNICAL-SETUP.md)
- [Debugging Guide](./Technical-Reference/DEBUGGING-GUIDE.md)

## Install Dependencies

```bash
# install project packages
yarn install
```

## Run the Type Checker

```bash
# verify type safety without generating files
npx tsc --noEmit
```

## Missing `@types/*` Packages

- Search npm for the corresponding `@types` package (e.g. `@types/lodash`).
- Add it as a dev dependency:
  ```bash
  yarn add -D @types/<package>
  ```
- If no typings exist, create a `.d.ts` file in `types/` and declare the module.

## Common Issues

- **Stale modules**: delete `node_modules` and run `yarn install` again.
- **Version mismatches**: ensure TypeScript and `@types/*` versions match the package.
- **Custom paths**: check `tsconfig.json` for correct `paths` and `baseUrl` settings.

