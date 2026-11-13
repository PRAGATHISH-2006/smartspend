import os
import struct
import base64
from PIL import Image
import numpy as np

# 1. Load the original uploaded image
src_path = r'C:/Users/HP/.gemini/antigravity/brain/b5f21fc3-a49b-4968-9c29-218c1771d105/.user_uploaded/media_1794561620301_cb2e9838.jpg'
im = Image.open(src_path)

# Card 1 (Top-Left 'App icon') coordinates
x1, y1, x2, y2 = 180, 71, 309, 202
crop = im.crop((x1, y1, x2, y2)).convert('RGBA')
arr = np.array(crop).astype(float)

# Background color on the card is pure white (255, 255, 255)
# Compute alpha channel for clean transparent cutout
diff_from_white = 255.0 - np.minimum(np.minimum(arr[:,:,0], arr[:,:,1]), arr[:,:,2])
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
saturation = np.maximum(np.maximum(np.abs(r - g), np.abs(r - b)), np.abs(g - b))

alpha = np.zeros_like(diff_from_white)
for y in range(arr.shape[0]):
    for x in range(arr.shape[1]):
        # Ignore bottom drop shadow below shield tip (row > 128)
        if y > 128 and saturation[y, x] < 20:
            alpha[y, x] = 0
        elif diff_from_white[y, x] < 6:
            alpha[y, x] = 0
        elif diff_from_white[y, x] > 35:
            alpha[y, x] = 255
        else:
            alpha[y, x] = int((diff_from_white[y, x] - 6) / (35 - 6) * 255)

out_arr = np.copy(arr)
out_arr[:,:,3] = alpha

out_img = Image.fromarray(out_arr.astype(np.uint8), 'RGBA')
bbox = out_img.getbbox()
pure_emblem = out_img.crop(bbox)
print(f'Extracted pure emblem size: {pure_emblem.size}')

# Save clean emblem asset
os.makedirs('assets/brand', exist_ok=True)
pure_emblem.save('assets/brand/emblem.png')

# Helper to place emblem centered with padding
def make_icon(size, padding_pct=0.06, bg_color=(0, 0, 0, 0)):
    canvas = Image.new('RGBA', (size, size), bg_color)
    padding = max(1, int(size * padding_pct))
    target_dim = size - padding * 2
    w, h = pure_emblem.size
    ratio = min(target_dim / w, target_dim / h)
    nw, nh = max(1, int(w * ratio)), max(1, int(h * ratio))
    resized = pure_emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

# 2. Generate PNG favicons
fav_16 = make_icon(16, padding_pct=0.04)
fav_32 = make_icon(32, padding_pct=0.05)
fav_48 = make_icon(48, padding_pct=0.06)
fav_64 = make_icon(64, padding_pct=0.06)

fav_16.save('public/favicon-16x16.png')
fav_32.save('public/favicon-32x32.png')

fav_64.save('assets/favicon.png')
fav_64.save('public/favicon.png')
fav_64.save('dist/favicon.png')

# 3. Generate Apple Touch Icon & PWA icons
apple_touch = make_icon(180, padding_pct=0.10, bg_color=(15, 23, 42, 255))
apple_touch.save('public/apple-touch-icon.png')
apple_touch.save('dist/apple-touch-icon.png')

icon_192 = make_icon(192, padding_pct=0.08, bg_color=(15, 23, 42, 255))
icon_192.save('public/icon-192.png')
icon_192.save('dist/icon-192.png')

icon_512 = make_icon(512, padding_pct=0.08, bg_color=(15, 23, 42, 255))
icon_512.save('public/icon-512.png')
icon_512.save('dist/icon-512.png')
icon_512.save('assets/brand/app_icon.png')

# 1024x1024 main app icons
icon_1024 = make_icon(1024, padding_pct=0.10, bg_color=(15, 23, 42, 255))
icon_1024.save('assets/icon.png')
icon_1024.save('assets/adaptive-icon.png')

# 4. Generate Multi-size ICO (16, 32, 48, 64) with full 32-bpp RGBA transparency
master_256 = make_icon(256, padding_pct=0.06)
master_256.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
master_256.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
master_256.save('dist/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# 5. Export base64 string for 32x32 transparent favicon
with open('public/favicon-32x32.png', 'rb') as f:
    b64_32 = base64.b64encode(f.read()).decode('utf-8')

with open('src/utils/faviconBase64.ts', 'w', encoding='utf-8') as f:
    f.write(f"export const FAVICON_DATA_URI = 'data:image/png;base64,{b64_32}';\n")

print('Successfully generated all brand favicons and assets!')

