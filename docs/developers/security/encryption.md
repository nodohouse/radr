# Encryption and credential handling

Provider secrets must remain server-side. A production adapter requires an implemented, reviewed credential store, key rotation, tenant isolation and a deployment-specific transport/storage security review. KMS integration is a design requirement, not an assertion that a production provider secret store is available.

Document upload uses the private-object storage interface. Hosting configuration and storage permissions must still be verified. These notes do not claim SOC 2, ISO 27001 or PCI certification. See the repository security documentation for the implementation and current limitations.
