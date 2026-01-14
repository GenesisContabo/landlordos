#!/usr/bin/env python3
import requests
import json

# Vercel credentials
token = "Lj8oejZWJKGfmmb2bmcPJ0Lj"
project_id = "prj_QN3HywzNMl0lmPL5HXh6JWwE2i3g"

# Add environment variable
url = f"https://api.vercel.com/v10/projects/{project_id}/env"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
payload = {
    "key": "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "value": "G-5B00STQFQL",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
}

response = requests.post(url, headers=headers, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code in [200, 201]:
    print("\n✅ Successfully added NEXT_PUBLIC_GA_MEASUREMENT_ID to Vercel")
else:
    print(f"\n❌ Failed to add environment variable")
