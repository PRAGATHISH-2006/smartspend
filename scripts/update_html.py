import base64

with open('public/favicon-32x32.png', 'rb') as f:
    b64_32 = base64.b64encode(f.read()).decode('utf-8')

with open('public/favicon-16x16.png', 'rb') as f:
    b64_16 = base64.b64encode(f.read()).decode('utf-8')

data_uri_32 = f'data:image/png;base64,{b64_32}'
data_uri_16 = f'data:image/png;base64,{b64_16}'

html = f'''<!DOCTYPE html>
<html lang="ta">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>வெற்றி நிதி மேலாண்மை</title>

    <!-- Immediate Favicons (Inline Data URIs bypass all browser HTTP caches) -->
    <link rel="icon" type="image/png" sizes="32x32" href="{data_uri_32}" />
    <link rel="icon" type="image/png" sizes="16x16" href="{data_uri_16}" />
    <link rel="shortcut icon" type="image/png" href="{data_uri_32}" />
    <link rel="alternate icon" type="image/x-icon" href="/favicon.ico?v=202611" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=202611" />
    <link rel="manifest" href="/manifest.json" />

    <meta name="theme-color" content="#059669" />
    <meta name="description" content="வெற்றி நிதி மேலாண்மை - Finance Management for All Citizens" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="வெற்றி நிதி மேலாண்மை" />

    <!-- React Native Web Reset -->
    <style id="expo-reset">
      html, body {{
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #0F172A;
      }}
      body {{
        overflow: hidden;
      }}
      #root {{
        display: flex;
        height: 100%;
        flex: 1;
      }}
    </style>
    <script>
      (function() {{
        document.title = 'வெற்றி நிதி மேலாண்மை';
      }})();
    </script>
  </head>

  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>
'''

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated public/index.html, web/index.html, dist/index.html')

