from PIL import Image

img = Image.open(r"C:\Users\Vipul_kumawat\.gemini\antigravity-ide\brain\58e9a0c0-6940-43fa-8e62-8c93adbc2119\media__1783762825831.png")
print("Size:", img.size)

# Find non-black rows and columns
width, height = img.size
rgba = img.convert("RGBA")
pix = rgba.load()

# Let's print some sample pixel colors from the top, middle, and bottom
print("Top pixel (0,0):", pix[0, 0])
print("Middle pixel (w/2, h/2):", pix[width//2, height//2])
print("Bottom pixel (0, h-1):", pix[0, height-1])

# Scan for the circle: it is green. Green HSL has green dominance (e.g. g > r and g > b)
# Let's find the bounding box of green pixels.
min_x, min_y, max_x, max_y = width, height, 0, 0
for y in range(height):
    for x in range(width):
        r, g, b, a = pix[x, y]
        # Check if the pixel matches the green color of the logo (e.g. g is around 160-210, r is 140-190, b is 110-160)
        # Or simply check if the pixel is NOT black and NOT white
        is_bg = (r < 20 and g < 20 and b < 20) or (r > 245 and g > 245 and b > 245)
        if not is_bg:
            if x < min_x: min_x = x
            if y < min_y: min_y = y
            if x > max_x: max_x = x
            if y > max_y: max_y = y

print(f"Detected logo bounding box: left={min_x}, top={min_y}, right={max_x}, bottom={max_y}")
