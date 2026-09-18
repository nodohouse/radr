# Adding an Integration

Last updated: 2026-08-24

1. Add provider entry to `lib/integrations/registry.ts` with honest status  
2. Create adapter implementing the correct interface under `lib/integrations/adapters/`  
3. Create normalizer under `lib/integrations/normalize/`  
4. Define scopes / required credentials (placeholders in `.env.example`)  
5. Add webhook verification **from official docs** if applicable  
6. Add health check  
7. Add sanitized fixtures + Vitest coverage  
8. Add guide under `docs/developers/integrations/<category>/`  
9. Update provider matrix + changelog  
10. Security review (secrets, PII, PCI)  
11. Launch as `beta`  
12. Promote to `available` after validation  

Do not mark `available` until production-ready.
