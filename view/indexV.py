def country_info(dt):
    try:
        _result = {
            "data":{}
        }

        dt_list = ["選擇地區"]
        for (country,) in dt:
            dt_list.append(country)

        _result["data"] = {"country": dt_list}
        return _result
    except Exception:
        return {"error": "根據執行結果發生錯誤。"}
    
def city_info(dt):
    try:
        _result = {
            "data":{}
        }
        
        dt_list = ["選擇城市"]
        for (city,) in dt:
            dt_list.append(city)

        _result["data"] = {"city": dt_list}
        return _result
    except Exception:
        return {"error": "根據執行結果發生錯誤。"}
    
def types_info(dt):
    try:
        _result = {
            "data":{}
        }

        dt_list = ["店家種類"]
        for (types,) in dt:
            dt_list.append(types)

        _result["data"] = {"types": dt_list}
        return _result
    except Exception:
        return {"error": "根據執行結果發生錯誤。"}