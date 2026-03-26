from dotenv import load_dotenv
import os

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

        dt_list = ["全部種類"]
        for (types,) in dt:
            dt_list.append(types)

        _result["data"] = {"types": dt_list}
        return _result
    except Exception:
        return {"error": "根據執行結果發生錯誤。"}
    
def posts_marker_info(dt):
    try:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        dt_json = {
                "data":[]
            }

        i = 0
        for item in dt:
            info_json = {}
            img_split = item[3].split(",")
            imgUrl = url+img_split[0]

            info_json["post_id"]=item[0]
            info_json["lat"]=float(item[1])
            info_json["lon"]=float(item[2])
            info_json["img"]=imgUrl

            dt_json["data"].append(info_json)
            i+= 1

        return dt_json
    except Exception:
        return {"error": "取貼文資料發生錯誤。"}
    
def marker_posts_data(dt):
    try:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        dt_json = {
                "data":[]
            }

        i = 0
        for item in dt:
            info_json = {"post":{},
                         "user":{}
                         }

            imgUrl = []
            for im in item[6].split(","):
                imgUrl.append(url+im)
            
            foodNM = []
            for name in item[7].split(","):
                foodNM.append(name)

            foodPrice = []
            for price in item[8].split(","):
                foodPrice.append(price)

            user_liked = "no" if item[14] == None else "yes"
            user_collected = "no" if item[13] == None else "yes"
            user_follow = "no" if item[15] == None else "yes"

            # 貼文的資料
            info_json["post"]["post_id"]=item[0]
            info_json["post"]["name"]=item[5]
            info_json["post"]["img"]=imgUrl
            info_json["post"]["foodname"]=foodNM
            info_json["post"]["price"]=foodPrice
            info_json["post"]["comment"]=item[9]
            info_json["post"]["area"]=item[10]
            info_json["post"]["co_total"] = item[11]
            info_json["post"]["lk_total"] = item[12]
            info_json["post"]["co_click"] = user_collected
            info_json["post"]["lk_click"] = user_liked
            info_json["post"]["follow"] = user_follow
            # 使用者的資料
            info_json["user"]["user_id"]=item[1]
            info_json["user"]["name"]=item[2]
            info_json["user"]["nickname"]=item[3]
            if (item[4] != None):
                info_json["user"]["headshot"]=url+item[4]
            else:
                info_json["user"]["headshot"]=item[4]

            dt_json["data"].append(info_json)
            i+= 1

        return dt_json
    except Exception as e:
        print(e)
        return {"error": "取標記圖示的貼文資料發生錯誤。"}
    
def marker_posts_data_visitor(dt):
    try:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        dt_json = {
                "data":[]
            }

        i = 0
        for item in dt:
            info_json = {"post":{},
                         "user":{}
                         }

            imgUrl = []
            for im in item[6].split(","):
                imgUrl.append(url+im)
            
            foodNM = []
            for name in item[7].split(","):
                foodNM.append(name)

            foodPrice = []
            for price in item[8].split(","):
                foodPrice.append(price)

            # 貼文的資料
            info_json["post"]["post_id"]=item[0]
            info_json["post"]["name"]=item[5]
            info_json["post"]["img"]=imgUrl
            info_json["post"]["foodname"]=foodNM
            info_json["post"]["price"]=foodPrice
            info_json["post"]["comment"]=item[9]
            info_json["post"]["area"]=item[10]
            info_json["post"]["co_total"] = item[11]
            info_json["post"]["lk_total"] = item[12]
            info_json["post"]["co_click"] = "no"
            info_json["post"]["lk_click"] = "no"
            info_json["post"]["follow"] = "no"
            # 使用者的資料
            info_json["user"]["user_id"]=item[1]
            info_json["user"]["name"]=item[2]
            info_json["user"]["nickname"]=item[3]
            if (item[4] != None):
                info_json["user"]["headshot"]=url+item[4]
            else:
                info_json["user"]["headshot"]=item[4]

            dt_json["data"].append(info_json)
            i+= 1

        return dt_json
    except Exception as e:
        print(e)
        return {"error": "取標記圖示的貼文資料發生錯誤。"}

def follow_user_info(dt):
    try:
        _result = {
            "data":[]
        }

        i = 0
        for (id, name) in dt:
            dt_list = {str(i):[id, name]}
            _result["data"].append(dt_list)
            i+=1

        return _result
    except Exception:
        return {"error": "整理追蹤的資料發生錯誤。"}

