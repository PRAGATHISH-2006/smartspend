import os
import subprocess

print("Running post-build to inject brand favicons and meta tags into dist/index.html...")
subprocess.run(["node", "scripts/post-build.js"], check=True)
