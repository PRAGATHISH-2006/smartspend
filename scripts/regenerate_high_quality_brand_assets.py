import os
import base64
from PIL import Image
import numpy as np

print("Regenerating all brand assets with the new HIGH-QUALITY master images...")

# 1. Load the new 1024x1024 high-resolution master emblem
src_emblem_path = r'C:/Users/HP/.gemini/antigravity/brain/dbd9a051-40dd-49c2-9a86-3420b75e152d/.user_uploaded/media_1794904382288_32ce8f7d.jpg'
src_logo_path = r'C:/Users/HP/.gemini/antigravity/brain/dbd9a051-40dd-49c2-9a86-3420b75e152d/.user_uploaded/media_1794904382541_cb93b6d5.jpg'

im_emblem = Image.open(src_emblem_path).convert('RGBA')
arr_e = np.array(im_emblem).astype(float)

# Background is pure white (255, 255, 255)
diff_e = 255.0 - np.minimum(np.minimum(arr_e[:,:,0], arr_e[:,:,1]), arr_e[:,:,2])
r_e, g_e, b_e = arr_e[:,:,0], arr_e[:,:,1], arr_e[:,:,2]
sat_e = np.maximum(np.maximum(np.abs(r_e - g_e), np.abs(r_e - b_e)), np.abs(g_e - b_e))

# Cut out shield emblem without bottom drop shadow
alpha_e = np.zeros((arr_e.shape[0], arr_e.shape[1]), dtype=float)
for y in range(arr_e.shape[0]):
    for x in range(arr_e.shape[1]):
        if y > 865 and sat_e[y, x] < 20:
            alpha_e[y, x] = 0.0
        elif diff_e[y, x] < 4.0:
            alpha_e[y, x] = 0.0
        elif diff_e[y, x] > 28.0:
            alpha_e[y, x] = 1.0
        else:
            alpha_e[y, x] = (diff_e[y, x] - 4.0) / (28.0 - 4.0)

# De-multiply white background on edges to eliminate white fringes
clean_e = np.zeros((arr_e.shape[0], arr_e.shape[1], 4), dtype=np.uint8)
a_exp_e = alpha_e[:, :, np.newaxis]
safe_a_e = np.maximum(a_exp_e, 1e-4)
rgb_clean_e = np.clip((arr_e[:, :, :3] - (1.0 - a_exp_e) * 255.0) / safe_a_e, 0, 255)
clean_e[:, :, :3] = rgb_clean_e.astype(np.uint8)
clean_e[:, :, 3] = (alpha_e * 255.0).astype(np.uint8)

img_clean_emblem = Image.fromarray(clean_e, 'RGBA')
# Crop strictly to the shield boundaries
bbox_e = (203, 163, 896, 866)
pure_emblem = img_clean_emblem.crop(bbox_e)
print(f"Extracted high-res pure emblem size: {pure_emblem.size}")

# Save master emblem
os.makedirs('assets/brand', exist_ok=True)
pure_emblem.save('assets/brand/emblem.png')
print("Saved assets/brand/emblem.png")

# 2. Extract High-Res Full Header Logo from Image 2
im_logo = Image.open(src_logo_path).convert('RGBA')
crop_logo = im_logo.crop((120, 150, 915, 415))
arr_l = np.array(crop_logo).astype(float)
diff_l = 255.0 - np.minimum(np.minimum(arr_l[:,:,0], arr_l[:,:,1]), arr_l[:,:,2])

alpha_l = np.zeros((arr_l.shape[0], arr_l.shape[1]), dtype=float)
for y in range(arr_l.shape[0]):
    for x in range(arr_l.shape[1]):
        if diff_l[y, x] < 6.0:
            alpha_l[y, x] = 0.0
        elif diff_l[y, x] > 32.0:
            alpha_l[y, x] = 1.0
        else:
            alpha_l[y, x] = (diff_l[y, x] - 6.0) / (32.0 - 6.0)

clean_l = np.zeros((arr_l.shape[0], arr_l.shape[1], 4), dtype=np.uint8)
a_exp_l = alpha_l[:, :, np.newaxis]
safe_a_l = np.maximum(a_exp_l, 1e-4)
rgb_clean_l = np.clip((arr_l[:, :, :3] - (1.0 - a_exp_l) * 255.0) / safe_a_l, 0, 255)
clean_l[:, :, :3] = rgb_clean_l.astype(np.uint8)
clean_l[:, :, 3] = (alpha_l * 255.0).astype(np.uint8)

img_clean_logo = Image.fromarray(clean_l, 'RGBA')
bbox_l = img_clean_logo.getbbox()
pure_logo = img_clean_logo.crop(bbox_l)
print(f"Extracted high-res logo size: {pure_logo.size}")

pure_logo.save('assets/brand/header_logo.png')
print("Saved assets/brand/header_logo.png")

# 3. Helper to create centered icons on dark slate #0F172A or transparent
def make_icon(size, padding_pct=0.08, bg_color=(15, 23, 42, 255)):
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

# Transparent favicons helper
def make_transparent_icon(size, padding_pct=0.04):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
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

# 4. Generate App Icons & Adaptive Icons
icon_1024 = make_icon(1024, padding_pct=0.10, bg_color=(15, 23, 42, 255))
icon_1024.save('assets/icon.png')
icon_1024.save('assets/adaptive-icon.png')
print("Saved assets/icon.png & assets/adaptive-icon.png (1024x1024)")

icon_512 = make_icon(512, padding_pct=0.10, bg_color=(15, 23, 42, 255))
icon_512.save('assets/brand/app_icon.png')
icon_512.save('public/icon-512.png')
print("Saved assets/brand/app_icon.png & public/icon-512.png (512x512)")

icon_192 = make_icon(192, padding_pct=0.08, bg_color=(15, 23, 42, 255))
icon_192.save('public/icon-192.png')
print("Saved public/icon-192.png (192x192)")

apple_touch = make_icon(180, padding_pct=0.10, bg_color=(15, 23, 42, 255))
apple_touch.save('public/apple-touch-icon.png')
print("Saved public/apple-touch-icon.png (180x180)")

# 5. Generate Favicons (16, 32, 48, 64)
fav_16 = make_transparent_icon(16, padding_pct=0.02)
fav_32 = make_transparent_icon(32, padding_pct=0.04)
fav_48 = make_transparent_icon(48, padding_pct=0.05)
fav_64 = make_transparent_icon(64, padding_pct=0.05)

fav_16.save('public/favicon-16x16.png')
fav_32.save('public/favicon-32x32.png')
fav_64.save('public/favicon.png')
fav_64.save('assets/favicon.png')

master_fav = make_transparent_icon(256, padding_pct=0.04)
master_fav.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
master_fav.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Saved all favicons (PNG and multi-size ICO)")

# 6. Update Base64 Favicon Data URI for immediate browser tab favicon
with open('public/favicon-32x32.png', 'rb') as f:
    b64_32 = base64.b64encode(f.read()).decode('utf-8')

with open('src/utils/faviconBase64.ts', 'w', encoding='utf-8') as f:
    f.write(f"export const FAVICON_DATA_URI = 'data:image/png;base64,{b64_32}';\n")
print("Updated src/utils/faviconBase64.ts with new high-res favicon data URI!")

print("All brand assets successfully replaced with the high-quality source graphics!")

