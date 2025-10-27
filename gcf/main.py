import asyncio
import aiohttp
from flask import jsonify, make_response, request

PVWATTS_KEY = "xImLi895vhAer05uGQXXoLZK2Tw8gCCdIJX41YFp"
PVWATTS_URL = "https://developer.nrel.gov/api/pvwatts/v8.json"

# [array_type][module_type]
PVWATTS_ESTIMATED_DOLLAR_PER_WATT_MATRIX_5X3_LIST = [
    [2.80, 2.90, 2.70],  # 0: Fixed - Open Rack
    [3.20, 3.30, 3.10],  # 1: Fixed - Roof Mounted
    [2.40, 2.50, 2.30],  # 2: 1-Axis
    [2.50, 2.60, 2.40],  # 3: 1-Axis Backtracking
    [2.70, 2.80, 2.60],  # 4: 2-Axis
]


async def fetch_pvwatts(session, params):
    """Fetch PVWatts data and return (json, ac_annual)."""
    async with session.get(PVWATTS_URL, params=params) as resp:
        data = await resp.json()
        ac_annual = data.get("outputs", {}).get("ac_annual", 0)
        return data, ac_annual

# Helper function to calculate the score
def calculate_score(array_type, module_type, ac_annual, spending):
    """Calculate the score based on annual energy and price per watt."""
    # Note: array_type must be int, module_type must be int
    array_type = int(array_type)
    module_type = int(module_type)
    
    price_per_watt = PVWATTS_ESTIMATED_DOLLAR_PER_WATT_MATRIX_5X3_LIST[array_type][module_type]
    # (spending / (price_per_watt * 1000 W/kW)) * ac_annual (kWh/kW/yr)
    score = (spending / (price_per_watt * 1000)) * ac_annual
    return score

async def get_best_item(lat, lon, purpose, spending=1000):
    # Select array types based on purpose
    if purpose == "A":
        array_types = [0, 1, 3]
    else:
        array_types = [2, 3, 4]

    # Initialize variables for the initial search (using module_type = 0)
    module_type_0 = 0 
    tilt_angles = [-30, -15, 0, 15, 30]
    highestScore = float("-inf")
    bestItem = None

    async with aiohttp.ClientSession() as session:
        # --- Step 1: Find best array_type and tilt_angle using module_type = 0 ---
        for array_type in array_types:
            # Launch all 5 tilt angle requests concurrently
            tasks = []
            for tilt_angle in tilt_angles:
                azimuth = 180 if tilt_angle < 0 else 0
                tilt = abs(tilt_angle)

                params = {
                    "api_key": PVWATTS_KEY,
                    "lat": lat,
                    "lon": lon,
                    "system_capacity": 1,
                    "module_type": module_type_0,
                    "array_type": array_type,
                    "losses": 10,
                    "tilt": tilt,
                    "azimuth": azimuth,
                }
                tasks.append(fetch_pvwatts(session, params))

            results = await asyncio.gather(*tasks)

            # Pick best tilt angle for this array_type
            for (data, ac_annual), _ in zip(results, tilt_angles):
                # We use module_type_0 here
                score = calculate_score(array_type, module_type_0, ac_annual, spending)

                if score > highestScore:
                    highestScore = score
                    bestItem = data
        
        # --- Step 2: Compare module types 1 and 2 using the best configuration found ---
        if bestItem is not None:
            
            # Extract the best configuration parameters from the winning item's 'inputs'
            best_inputs = bestItem.get('inputs', {})
            
            # Note: PVWatts JSON returns these as strings, so we ensure they are integers for list indexing
            best_array_type = int(best_inputs.get('array_type', 0)) 
            best_tilt = best_inputs.get('tilt')
            best_azimuth = best_inputs.get('azimuth')
            
            # Module types to test
            other_module_types = [1, 2]
            
            # Prepare and launch requests for module types 1 and 2 concurrently
            test_tasks = []
            for new_module_type in other_module_types:
                params = {
                    "api_key": PVWATTS_KEY,
                    "lat": lat,
                    "lon": lon,
                    "system_capacity": 1,
                    "module_type": new_module_type, # <--- Testing new module type
                    "array_type": best_array_type, # Fixed to best array type
                    "losses": 10,
                    "tilt": best_tilt, # Fixed to best tilt
                    "azimuth": best_azimuth, # Fixed to best azimuth
                }
                test_tasks.append(fetch_pvwatts(session, params))

            test_results = await asyncio.gather(*test_tasks)

            # Compare scores and update bestItem if necessary
            for (data, ac_annual), new_module_type in zip(test_results, other_module_types):
                # Calculate the score using the new module type's price
                score = calculate_score(best_array_type, new_module_type, ac_annual, spending)
                
                if score > highestScore:
                    highestScore = score
                    bestItem = data # Update to the new best item

    return bestItem


def get_pvwatts(request):
    # Handle CORS preflight
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
    spending = request_json.get("spending", 1000)

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400
    if purpose not in ["A", "B"]:
        return jsonify({"error": "Purpose must be 'A' or 'B'"}), 400

    best_item = asyncio.run(get_best_item(lat, lon, purpose, spending))

    response = jsonify(best_item)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response