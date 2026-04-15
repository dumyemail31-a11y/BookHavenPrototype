import pathlib
import re
root = pathlib.Path('.')
files = [p for p in root.glob('*.html') if p.is_file()]
for path in files:
    text = path.read_text(encoding='utf-8')
    orig = text
    text = text.replace('href="css/', 'href="static/css/')
    text = text.replace("href='css/", "href='static/css/")
    text = text.replace('src="js/', 'src="static/js/')
    text = text.replace("src='js/", "src='static/js/")
    text = text.replace('href="images/', 'href="static/images/')
    text = text.replace("href='images/", "href='static/images/")
    text = text.replace('src="images/', 'src="static/images/')
    text = text.replace("src='images/", "src='static/images/")
    text = text.replace('src="static/js/bootsnav.js."', 'src="static/js/bootsnav.js"')
    text = text.replace('templates/my-account.html', 'my-account.html')
    text = text.replace('templates/service.html', 'service.html')
    text = text.replace('templates/contact-us.html', 'contact-us.html')
    text = text.replace('templates/index.html', 'index.html')
    if path.name == 'index.html':
        text = re.sub(r'<script>\s*let cart = JSON\.parse\(localStorage\.getItem\(\\'cart\\'\)\) \|\| \[\];[\s\S]*?</script>', '', text, flags=re.MULTILINE)
        text = re.sub(r'<div class="categories-shop">[\s\S]*?</div>\s*<!-- End Categories -->', '', text, flags=re.MULTILINE)
    if '<script src="static/js/app.js"></script>' not in text:
        body_close = text.rfind('</body>')
        if body_close != -1:
            text = text[:body_close] + '    <script src="static/js/app.js"></script>\n' + text[body_close:]
    if text != orig:
        path.write_text(text, encoding='utf-8')
        print('patched', path.name)
