from dotenv import load_dotenv
import os

def post_content_data(dt):
    if type(dt) != bool:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        
        user_name = dt[2] if dt[2] != "" else dt[1]

        user_liked = "no" if dt[14] == None else "yes"
        user_collected = "no" if dt[13] == None else "yes"

        if (dt[3] == None):
            user_headshot = ""
        else:
            user_headshot = url+dt[3]
        dt_json = {
            "data":{
                "user_id": dt[0],
                "name": user_name,
                "headshot": user_headshot,
                "store_address": dt[4],
                "store_name": dt[5],
                "img": [],
                "food_name": [],
                "food_price": [],
                "comment": dt[9],
                "environment": dt[10],
                "collect_count": dt[11],
                "like_count": dt[12],
                "liked": user_liked,
                "collected": user_collected,
            }
        }
        if dt == []:
            return {"data":"無資料"}

        img_split = dt[6].split(",")
        for img_item in img_split:
            imgUrl = url+img_item
            dt_json["data"]["img"].append(imgUrl)

        for name_item in dt[7].split(","):
            dt_json["data"]["food_name"].append(name_item)

        for price_item in dt[8].split(","):
            dt_json["data"]["food_price"].append(price_item)
            
        return dt_json
    
    return {"error": "取發文的內容出現錯誤"}