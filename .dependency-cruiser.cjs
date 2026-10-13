/**
 * Module boundaries from ADR 0001:
 *   app -> features/* -> shared
 * A feature exposes only the files at its root (index.ts, actions.ts); its
 * subfolders (lib/, ui/, tests/) are private. Cycles are forbidden.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Import cycles make modules impossible to reason about.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-deep-import-into-other-feature",
      severity: "error",
      comment:
        "A feature may import another feature only through its root entry points (index.ts, actions.ts), never its subfolders.",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/[^/]+/.+/",
        pathNot: "^src/features/$1/",
      },
    },
    {
      name: "no-deep-import-into-feature-from-app-or-shared",
      severity: "error",
      comment: "app/ and shared/ may use only a feature's root entry points.",
      from: { path: "^src/(app|shared)/" },
      to: { path: "^src/features/[^/]+/.+/" },
    },
    {
      name: "shared-is-a-leaf",
      severity: "error",
      comment: "shared/ must not depend on features/ or app/.",
      from: { path: "^src/shared/" },
      to: { path: "^src/(features|app)/" },
    },
    {
      name: "features-do-not-import-app",
      severity: "error",
      comment: "Dependency direction is app -> features, never the reverse.",
      from: { path: "^src/features/" },
      to: { path: "^src/app/" },
    },
    {
      name: "prisma-only-behind-repositories",
      severity: "error",
      comment:
        "UI and routes must not touch the database client; go through actions.",
      from: { path: "^src/(app/|features/[^/]+/ui/)" },
      to: { path: "^src/(shared/db|generated)/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^src/generated/" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
