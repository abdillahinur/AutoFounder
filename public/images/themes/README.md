Replace these placeholder images with your own theme backgrounds.

Structure:
  themes/
    investor/cover.jpg
    investor/content.jpg
    minimal/cover.jpg
    minimal/content.jpg
    bold/cover.jpg
    bold/content.jpg
    clinical/cover.jpg
    clinical/content.jpg
    eco/cover.jpg
    eco/content.jpg
    infra/cover.jpg
    infra/content.jpg

Notes:
- Filenames must match exactly to be picked up by the app (e.g. `/images/bg-cover-fintech-v1.png` maps to theme assets, but these theme placeholders are used when THEME_ASSETS references `/images/themes/<theme>/cover.jpg`).
- Replace with high-resolution JPG or PNG images. Keep aspect ratio around 16:9 for best visual fit.
- After replacing, restart the dev server if necessary so Vite picks up new static assets.
