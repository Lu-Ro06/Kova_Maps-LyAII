import requests

url = "https://overpass-api.de/api/interpreter"
query = """
[out:json][timeout:25];
area["name"="México"]->.searchArea;
node["barrier"="toll_booth"](area.searchArea);
out body;
"""
headers = {
    'User-Agent': 'AntigravityAgent/1.0',
    'Accept': '*/*'
}
response = requests.post(url, data={'data': query}, headers=headers)
if response.status_code == 200:
    data = response.json()
    elements = data.get('elements', [])
    print(f"Found {len(elements)} toll booths in Mexico.")
    import json
    with open("casetas_mexico.json", "w", encoding="utf-8") as f:
        json.dump(elements, f, ensure_ascii=False, indent=2)
else:
    print("Error:", response.status_code, response.text)
