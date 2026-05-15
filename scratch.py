import re

with open("Tarifas-vigentes-2026.txt", "r") as f:
    text = f.read()

# We need to extract Caseta Name and Auto Price. 
lines = text.split("\n")
casetas = []
for i, line in enumerate(lines[:500]):
    if re.search(r'\d+$', line.strip()) and not re.search(r'^[B-C]\d+', line.strip()) and len(line) > 5:
        print(line.strip())
