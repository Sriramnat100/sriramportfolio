import requests
import os
from io import BytesIO

# ... your image generation code ...

# Convert PIL image to bytes
buffer = BytesIO()
combined.save(buffer, format="PNG")
buffer.seek(0)

# Supabase details
SUPABASE_URL = "https://igycibrjzeqrgkhnifoz.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneWNpYnJqemVxcmdraG5pZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MzQsImV4cCI6MjA2NzM1NjgzNH0.tN4PgiNeTPal7pkR3rkPNppXoCltHIw-W2gVfw0cSPc"
BUCKET = "generated-images"
FILENAME = "final_output.png"  # or generate a unique name

# Upload to Supabase Storage
upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{FILENAME}"
headers = {
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "image/png"
}
response = requests.post(upload_url, headers=headers, data=buffer.getvalue())

if response.status_code == 200 or response.status_code == 201:
    print("✅ Image uploaded to Supabase Storage!")
else:
    print("❌ Upload failed:", response.status_code, response.text)