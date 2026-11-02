import {afterEach,describe,it,expect,vi} from "vitest";
import {accountStorageReady} from "@/lib/identity/accountAvailability";
import {safeInternalPath} from "@/lib/security/safe-redirect";
afterEach(()=>vi.unstubAllEnvs());
describe('account entry boundaries',()=>{
 it('allows local PGlite but requires persistent SQL storage for hosted identities',()=>{
  vi.stubEnv('VERCEL','');vi.stubEnv('DATABASE_URL','');expect(accountStorageReady()).toBe(true);
  vi.stubEnv('VERCEL','1');expect(accountStorageReady()).toBe(false);
  vi.stubEnv('DATABASE_URL','postgres://test.invalid/radr');expect(accountStorageReady()).toBe(true);
 });
 it('keeps valid internal return paths and rejects encoded external-path tricks',()=>{
  expect(safeInternalPath('/app/decisions?band=needs_you')).toBe('/app/decisions?band=needs_you');
  for(const path of ['//example.test','/%5cexample.test','/%0aexample.test','https://example.test'])expect(safeInternalPath(path)).toBe('/onboarding');
 });
});
