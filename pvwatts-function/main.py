from flask import jsonify, make_response, request
import requests

PVWATTS_KEY = "xImLi895vhAer05uGQXXoLZK2Tw8gCCdIJX41YFp"

def get_pvwatts(request):
    # Allow CORS preflight
    if request.method == "OPTIONS":
        response = make_response("", 204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    request_json = request.get_json(silent=True)
    if not request_json:
        return jsonify({"error": "Invalid JSON body"}), 400

    lat = request_json.get("lat")
    lon = request_json.get("lon")
    purpose = request_json.get("purpose")

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400
    if purpose not in ["A", "B"]:
        return jsonify({"error": "Purpose must be 'A' or 'B'"}), 400

    params = {
        "api_key": PVWATTS_KEY,
        "lat": lat,
        "lon": lon,
        "system_capacity": 1,
        "module_type": 0,
        "array_type": 0,
        "losses": 10,
        "tilt": 0,
        "azimuth": 0,
    }

    try:
        response = requests.get("https://developer.nrel.gov/api/pvwatts/v8.json", params=params)
        response.raise_for_status()
        result = jsonify(response.json())
    except requests.RequestException as e:
        result = jsonify({"error": str(e)}), 500

    # Add CORS header
    result.headers["Access-Control-Allow-Origin"] = "*"
    return result
