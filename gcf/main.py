import asyncio
import aiohttp
from flask import jsonify, make_response, request
from scipy.interpolate import Rbf
from scipy.optimize import differential_evolution 
import numpy as np
import os 

# --- CONSTANTS ---
PVWATTS_KEY = os.environ.get("PVWATTS_KEY")
PVWATTS_URL = "https://developer.nrel.gov/api/pvwatts/v8.json"

PVWATTS_ESTIMATED_DOLLAR_PER_WATT_MATRIX_5X3_LIST = [
    [2.80, 2.90, 2.70],  # 0: Fixed - Open Rack
    [3.20, 3.30, 3.10],  # 1: Fixed - Roof Mounted
    [2.40, 2.50, 2.30],  # 2: 1-Axis
    [2.50, 2.60, 2.40],  # 3: 1-Axis Backtracking
    [2.70, 2.80, 2.60],  # 4: 2-Axis
]

AZIMUTHS = [0, 60, 120, 180, 240, 300]
TILTS = [0, 10, 20, 30, 40]
MODULE_TYPES_TO_TEST = [0, 1, 2] 
# --- END CONSTANTS ---


async def fetch_pvwatts(session, params):
    """Fetch PVWatts data and return (json, ac_annual)."""
    async with session.get(PVWATTS_URL, params=params) as resp:
        data = await resp.json()
        return data

def calculate_score(array_type, module_type, ac_annual, spending):
    """Calculate the score based on annual energy and price per watt."""
    array_type = int(array_type)
    module_type = int(module_type)
    
    price_per_watt = PVWATTS_ESTIMATED_DOLLAR_PER_WATT_MATRIX_5X3_LIST[array_type][module_type]
    score = (spending / (price_per_watt * 1000)) * ac_annual
    return score

def optimize_tilt_azimuth(ac_annual_data, array_type, module_type, spending):
    """Interpolates AC annual data using RBF and optimizes to find max score."""
    if not ac_annual_data:
        return None, None, float("-inf"), 0

    # 1. Prepare data for RBF interpolation
    tilts = np.array([d[0] for d in ac_annual_data])
    azimuths = np.array([d[1] for d in ac_annual_data])
    values = np.array([d[2] for d in ac_annual_data])

    interpolator = Rbf(tilts, azimuths, values, function='multiquadric')

    # 2. Define the objective function (minimize the negative score)
    def negative_score(params):
        tilt, azimuth = params
        tilt = np.clip(tilt, 0, 50)
        azimuth = np.clip(azimuth, 0, 359)
        ac_annual = interpolator(tilt, azimuth) 
        score = calculate_score(array_type, module_type, ac_annual, spending)
        return -score

    # 3. Perform optimization
    bounds = [(0, 50), (0, 359)]

    result = differential_evolution(
        negative_score,
        bounds=bounds,
        strategy='best1bin',
        maxiter=100,        
        popsize=15,         # controls number of candidate points per iteration
        tol=1e-6,
        polish=True,        
        updating='deferred',
    )

    if result.success:
        best_tilt = np.round(result.x[0], 2)
        best_azimuth = np.round(result.x[1], 2)
        max_score = -result.fun
        best_ac_annual = interpolator(best_tilt, best_azimuth)
        return best_tilt, best_azimuth, max_score, best_ac_annual
    else:
        # Fall back to the best point in the initial grid if optimization fails
        best_index = np.argmax(values)
        best_tilt, best_azimuth = tilts[best_index], azimuths[best_index]
        max_score = calculate_score(array_type, module_type, values[best_index], spending)
        return best_tilt, best_azimuth, max_score, values[best_index]


async def get_best_item(lat, lon, answers, spending=1000):
    if answers[0] == "A":
        if answers[1] == "A":
            array_types = [1]
        else:
            array_types = [0]
    else:
        if answers[1] == "A":
            array_types = [2, 3, 4]
        else:
            array_types = [0]

    highestScore = float("-inf")
    bestItem = None
    
    final_best_array_type = None
    final_best_tilt = None
    final_best_azimuth = None

    async with aiohttp.ClientSession() as session:
        # --- Stage 1: Grid Search, Interpolation, and Optimization (for module_type 0) ---
        for array_type in array_types:
            # if type 4 , request only once
            if array_type == 4:
                params = {
                    "api_key": PVWATTS_KEY,
                    "lat": lat,
                    "lon": lon,
                    "system_capacity": 1,
                    "module_type": 0,
                    "array_type": 4,
                    "losses": 10,
                    "tilt": 0,     
                    "azimuth": 0,  
                }
                data = await fetch_pvwatts(session, params)

                ac_annual = data.get("outputs", {}).get("ac_annual", 0)
                score = calculate_score(4, 0, ac_annual, spending)

                if score > highestScore:
                    highestScore = score
                    final_best_array_type = array_type
                    final_best_tilt = 0
                    final_best_azimuth = 0
                continue  

            # 1. Create all API parameters for the 3x4 grid
            params_list = []
            for tilt in TILTS:
                for azimuth in AZIMUTHS:
                    params = {
                        "api_key": PVWATTS_KEY,
                        "lat": lat,
                        "lon": lon,
                        "system_capacity": 1,
                        "module_type": 0,
                        "array_type": array_type,
                        "losses": 10,
                        "tilt": tilt,
                        "azimuth": azimuth,
                    }
                    params_list.append(params)

            # 2. Launch all requests concurrently
            tasks = [fetch_pvwatts(session, params) for params in params_list]
            results = await asyncio.gather(*tasks)

            # 3. Consolidate results for optimization
            ac_annual_data = [] 
            grid_points = [(tilt, azimuth) for tilt in TILTS for azimuth in AZIMUTHS]

            for data, (tilt, azimuth) in zip(results, grid_points):
                 ac_annual = data.get("outputs", {}).get("ac_annual", 0) 
                 ac_annual_data.append((tilt, azimuth, ac_annual))

            # 4. Interpolate and Optimize
            best_tilt, best_azimuth, max_score, _ = optimize_tilt_azimuth(
                ac_annual_data, array_type, 0, spending
            )
            
            # 5. Compare with the overall best found so far
            if max_score > highestScore:
                highestScore = max_score
                final_best_array_type = array_type
                final_best_tilt = best_tilt
                final_best_azimuth = best_azimuth

        # --- Stage 2: Compare All Module Types at the Final Optimal Geometry ---
        if final_best_array_type is not None:
            
            # Prepare and launch requests for all 3 module types concurrently
            test_tasks = []
            for module_type in MODULE_TYPES_TO_TEST:
                params = {
                    "api_key": PVWATTS_KEY,
                    "lat": lat,
                    "lon": lon,
                    "system_capacity": 1,
                    "module_type": module_type,
                    "array_type": final_best_array_type,
                    "losses": 10,
                    "tilt": final_best_tilt,
                    "azimuth": final_best_azimuth,
                }
                test_tasks.append(fetch_pvwatts(session, params))

            final_results = await asyncio.gather(*test_tasks)

            if final_results:
                all_scores = [
                    calculate_score(
                        final_best_array_type,
                        int(data.get("inputs", {}).get("module_type", 0)),
                        data.get("outputs", {}).get("ac_annual", 0),
                        spending
                    )
                    for data in final_results
                ]

                best_score_index = np.argmax(all_scores)
                bestItem = final_results[best_score_index]
            else:
                bestItem = None

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
    answers = request_json.get("answers")
    spending = request_json.get("spending", 1000)

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400
    if not answers:
        return jsonify({"error": "Answer choices must be 'AB', etc"}), 400

    best_item = asyncio.run(get_best_item(lat, lon, answers, spending))

    response = jsonify(best_item)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response