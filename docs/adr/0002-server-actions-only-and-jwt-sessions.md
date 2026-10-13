# Server Actions only, no API routes, JWT sessions

All reads and writes go through `"use server"` Server Actions; `app/api` contains only the Auth.js route handler. Sessions use the JWT strategy, which is required for the Credentials provider and also satisfies the JWT requirement of the brief. Every action derives the Owner from the session, never from client input, and treats its arguments as untrusted because Server Actions are public endpoints.

Consequence: there is no REST contract to document or reuse; a future mobile client would need an API layer added on top of the services.
