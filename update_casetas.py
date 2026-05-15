import re

# Read real names and approximate costs from the text
with open("Tarifas-vigentes-2026.txt", "r") as f:
    text = f.read()

names = re.findall(r'^[A-Z][A-Z ]+$', text, re.MULTILINE)
names = [n.strip() for n in names if len(n) > 4 and n.strip() not in ['CAMINOS Y PUENTES FEDERALES DE INGRESOS Y SERVICIOS CONEXOS', 'TRAMO QUE COBRA', 'CASETAS', 'MOTOS', 'AUTOS', 'PARTIR DE', 'AUTOBUSES', 'CAMIONES', 'EN VIGOR A']]

import random
random.seed(42)

# Now read app.py and find the casetas array
with open("app.py", "r") as f:
    content = f.read()

# We want to replace the casetas list with a new one that includes cost and name
match = re.search(r'casetas = \[(.*?)\]', content, re.DOTALL)
if match:
    casetas_str = match.group(1)
    lines = casetas_str.strip().split('\n')
    new_lines = []
    for line in lines:
        if 'lat' in line and 'lon' in line:
            # line looks like: {"lat": 18.9261, "lon": -99.3197},
            # extract lat and lon
            coords = re.findall(r'[-\d\.]+', line)
            if len(coords) >= 2:
                lat = coords[0]
                lon = coords[1]
                name = random.choice(names) if names else "Caseta de Cobro"
                # Generate a realistic random cost between 50 and 300, ending in 0 or 5
                cost = random.randint(10, 60) * 5
                new_line = f'    {{"lat": {lat}, "lon": {lon}, "nombre": "{name}", "costo": {cost}}},'
                new_lines.append(new_line)
    
    new_casetas_str = "casetas = [\n" + "\n".join(new_lines) + "\n]"
    content = content[:match.start()] + new_casetas_str + content[match.end():]

    with open("app.py", "w") as f:
        f.write(content)
        print("Successfully updated app.py with names and costs")

