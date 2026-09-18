# Outbound webhook consumer

1. Read raw body  
2. Verify HMAC signature with your endpoint secret  
3. Parse JSON  
4. Deduplicate on `id`  
5. Process asynchronously  

Never skip signature verification.
