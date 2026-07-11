import os
from PIL import Image

def crop_and_transparent(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    
    # Exact circle bounds from analysis
    left = 38
    top = 320
    right = 420
    bottom = 702
    
    # Crop the exact circle square
    cropped = img.crop((left, top, right, bottom))
    
    c_width, c_height = cropped.size
    center_x = c_width / 2
    center_y = c_height / 2
    radius = min(c_width, c_height) / 2 - 2 # slightly inside the circle to get a clean border
    
    pixdata = cropped.load()
    for y in range(c_height):
        for x in range(c_width):
            dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
            if dist > radius:
                # Set background pixels outside the circle to transparent
                pixdata[x, y] = (255, 255, 255, 0)
    
    # Resize to standard high-quality favicon size
    final_img = cropped.resize((192, 192), Image.Resampling.LANCZOS)
    final_img.save(output_path, "PNG")
    print(f"Saved circular transparent logo to: {output_path}")

# Source image
source = r"C:\Users\Vipul_kumawat\.gemini\antigravity-ide\brain\58e9a0c0-6940-43fa-8e62-8c93adbc2119\media__1783762825831.png"

# Save destinations
destinations = [
    r"c:\Users\Vipul_kumawat\Documents\Projects\1312-cafe\frontend-customer\public\logo.png",
    r"c:\Users\Vipul_kumawat\Documents\Projects\1312-cafe\frontend-customer\src\assets\logo.png",
    r"C:\Users\Vipul_kumawat\Documents\Projects\customer_frontend\customer_frontend_1312\public\logo.png",
    r"C:\Users\Vipul_kumawat\Documents\Projects\customer_frontend\customer_frontend_1312\src\assets\logo.png",
    
    r"c:\Users\Vipul_kumawat\Documents\Projects\1312-cafe\frontend-admin\public\logo.png",
    r"c:\Users\Vipul_kumawat\Documents\Projects\1312-cafe\frontend-admin\src\assets\logo.png",
    r"C:\Users\Vipul_kumawat\Documents\Projects\admin_frontend\admin_frontend_1312\public\logo.png",
    r"C:\Users\Vipul_kumawat\Documents\Projects\admin_frontend\admin_frontend_1312\src\assets\logo.png"
]

for dest in destinations:
    crop_and_transparent(source, dest)
