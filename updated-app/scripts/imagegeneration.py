import os
from dotenv import load_dotenv
import openai
import requests
from PIL import Image
from io import BytesIO
import uuid



import requests
import os
from io import BytesIO



class ImageGeneration:

    def __init__(self):
        
        # Load .env variables
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = openai.OpenAI(api_key=self.api_key)
        self.SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.BUCKET = "generated-images"
        # Initialize OpenAI client


        

    def createImage(self, userprompt):
        
        # Generate image with DALL·E 3
        response = self.client.images.generate(
            model="dall-e-3",
            prompt=userprompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        # Download background
        image_url = response.data[0].url
        bg_response = requests.get(image_url)
        background = Image.open(BytesIO(bg_response.content)).convert("RGBA")

        # Load your transparent PNG
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        foreground_path = os.path.join(BASE_DIR, "sriramtransparent.png")
        foreground = Image.open(foreground_path).convert("RGBA")
        foreground = foreground.resize(background.size)

        # Composite and save
        combined = Image.alpha_composite(background, foreground)
        combined.save("combined.png")
        # combined = Image.new("RGBA", (600, 600), (255, 255, 255, 255))


        return self.uploadImage(combined)

    def uploadImage(self, combined):
        # Upload to Supabase Storage
        buffer = BytesIO()
        combined.save(buffer, format="PNG")
        buffer.seek(0)

 
       
        FILENAME = f"{uuid.uuid4()}.png" # or generate a unique name

        # Upload to Supabase Storage
        upload_url = f"{self.SUPABASE_URL}/storage/v1/object/{self.BUCKET}/{FILENAME}"
        headers = {
            "Authorization": f"Bearer {self.SUPABASE_ANON_KEY}",
            "apikey": self.SUPABASE_ANON_KEY,
            "Content-Type": "image/png"
        }
        response = requests.post(upload_url, headers=headers, data=buffer.getvalue())

        if response.status_code == 200 or response.status_code == 201:
            print("✅ Image uploaded to Supabase Storage!")
            public_url = f"https://igycibrjzeqrgkhnifoz.supabase.co/storage/v1/object/public/generated-images/{FILENAME}"
            return public_url
        else:
            print("❌ Upload failed:", response.status_code, response.text)
            return None



tester = ImageGeneration()
tester.createImage("A beautiful landscape with a river and mountains")