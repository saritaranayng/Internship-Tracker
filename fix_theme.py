import re

with open('/home/aviox/myproject/Internship-Tracker/public/css/style.css', 'r') as f:
    css = f.read()

# Update light mode vars
css = css.replace("""body.light-mode {
  --bg-dark: #f8fafc;
  --bg-darker: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #475569;
  --glass: rgba(0, 0, 0, 0.05);
  --glass-border: rgba(0, 0, 0, 0.1);
  --card-bg: rgba(255, 255, 255, 0.9);
}""", """body.light-mode {
  --bg-dark: #f4f7f6;
  --bg-darker: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --glass: rgba(0, 0, 0, 0.03);
  --glass-border: rgba(0, 0, 0, 0.08);
  --card-bg: #ffffff;
}
:root {
  --input-bg: rgba(0, 0, 0, 0.2);
}
body.light-mode {
  --input-bg: rgba(0, 0, 0, 0.04);
}""")

css = css.replace("background: rgba(0, 0, 0, 0.2);", "background: var(--input-bg);")
css = css.replace("color: white;\n  font-size: 1rem;", "color: var(--text-main);\n  font-size: 1rem;")

with open('/home/aviox/myproject/Internship-Tracker/public/css/style.css', 'w') as f:
    f.write(css)

with open('/home/aviox/myproject/Internship-Tracker/views/studentdashboard.ejs', 'r') as f:
    html = f.read()

# Fix inline styles for light mode compatibility
html = html.replace("color: #fff;", "color: var(--text-main);")
html = html.replace("color: white;", "color: var(--text-main);")
html = html.replace("background: rgba(255,255,255,0.05);", "background: var(--glass);")
html = html.replace("border: 1px solid rgba(255,255,255,0.1);", "border: 1px solid var(--glass-border);")
html = html.replace("background: rgba(255,255,255,0.1);", "background: var(--glass-border);")
html = html.replace("background-color: rgba(255,255,255,0.1);", "background-color: var(--glass-border);")
html = html.replace("background-color: white;", "background-color: var(--text-main);")
html = html.replace("rgba(255,255,255,0.03)", "var(--glass)")

# However, buttons with primary color should remain white text
html = html.replace("color: var(--text-main); border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;", "color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;")
html = html.replace("background: #ef4444; color: var(--text-main);", "background: #ef4444; color: #ffffff;")
html = html.replace("color: var(--text-main); border: none; border-radius: 8px; cursor: pointer;", "color: #ffffff; border: none; border-radius: 8px; cursor: pointer;")

with open('/home/aviox/myproject/Internship-Tracker/views/studentdashboard.ejs', 'w') as f:
    f.write(html)
print("Finished updates")
