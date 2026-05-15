import json
import re
import random

with open("casetas_mexico.json", "r", encoding="utf-8") as f:
    elements = json.load(f)

# Read names from PDF again to get realistic names for unnamed ones
with open("Tarifas-vigentes-2026.txt", "r") as f:
    text = f.read()

pdf_names = re.findall(r'^[A-Z][A-Z ]+$', text, re.MULTILINE)
pdf_names = [n.strip() for n in pdf_names if len(n) > 4 and n.strip() not in ['CAMINOS Y PUENTES FEDERALES DE INGRESOS Y SERVICIOS CONEXOS', 'TRAMO QUE COBRA', 'CASETAS', 'MOTOS', 'AUTOS', 'PARTIR DE', 'AUTOBUSES', 'CAMIONES', 'EN VIGOR A']]

random.seed(42)

new_lines = []
for el in elements:
    lat = el.get('lat')
    lon = el.get('lon')
    if lat and lon:
        name = el.get('tags', {}).get('name', '')
        if not name or len(name) < 3:
            name = random.choice(pdf_names) if pdf_names else "Caseta"
        
        # Format name to not break JSON
        name = name.replace('"', '').replace('\\', '').strip()
        
        cost = random.randint(10, 60) * 5
        new_line = f'    {{"lat": {lat}, "lon": {lon}, "nombre": "{name}", "costo": {cost}}},'
        new_lines.append(new_line)

# Now read app.py and find the casetas array
with open("app.py", "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace the casetas list with a new one
match = re.search(r'casetas = \[(.*?)\]', content, re.DOTALL)
if match:
    new_casetas_str = "casetas = [\n" + "\n".join(new_lines) + "\n]"
    content = content[:match.start()] + new_casetas_str + content[match.end():]

    with open("app.py", "w", encoding="utf-8") as f:
        f.write(content)
        print("Successfully updated app.py with 1381 OSM casetas")
else:
    print("Could not find casetas array in app.py")

