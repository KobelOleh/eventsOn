# Auth.js (next-auth) v5 beta, pinned to an exact version

The brief names next-auth, and v5 is the App Router-native version, but it is still beta (`5.0.0-beta.32`) and the Auth.js project has joined Better Auth, which only promises security fixes. We pin the exact version and keep all auth code inside the `auth` feature module, so moving to Better Auth later touches one module. The stable v4 was rejected because it fits Server Actions and the App Router poorly.
