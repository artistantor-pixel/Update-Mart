import os
import json
import base64
import hmac
import hashlib
import urllib.request
import urllib.parse
from dotenv import load_dotenv

load_dotenv('.env.local')
secret = os.environ.get('SUPABASE_JWT_SECRET')

header = {"alg": "HS256", "typ": "JWT"}
header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
payload = {"role": "service_role"}
payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
signature = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
token = f"{header_b64}.{payload_b64}.{signature_b64}"

url = "https://apstiiunljirfsjyowyl.supabase.co/rest/v1/admin_users?email=eq.artistantor@gmail.com"
headers = {
    "apikey": os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}
data = json.dumps({"password": "password"}).encode()

req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')
try:
    with urllib.request.urlopen(req, timeout=5) as res:
        print("Success:", res.read().decode())
except Exception as e:
    print("Error:", e)
