# Python example

```python
import os
import requests

response = requests.get(
    f"{os.environ['RADR_API_BASE_URL']}/v1/locations",
    headers={
        "Authorization": f"Bearer {os.environ['RADR_API_KEY']}"
    },
    timeout=20,
)

response.raise_for_status()
locations = response.json()
```

**API status: PROPOSED** until handlers ship.
