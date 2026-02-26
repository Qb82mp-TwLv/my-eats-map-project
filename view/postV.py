from dotenv import load_dotenv
import os

def post_content_data(dt):
    if type(dt) != bool:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}"


        user_name = dt[2] if dt[2] != "" else dt[1]
        user_headshot = url+dt[3]
        dt_json = {
            "data":{
                "user_id": dt[0],
                "name": user_name,
                "headshot": user_headshot,
                "img": [],
                "name": [],
                "price": [],
                "comment": dt[7],
                "environment": dt[8],
                "collect_count": dt[9],
                "like_count": dt[10]
            }
        }
        if dt == []:
            return {"data":"無資料"}

        img_split = dt[4].split(",")
        for img_item in img_split:
            imgUrl = url+img_item
            dt_json["data"]["img"].append(imgUrl)

        for name_item in dt[5].split(","):
            dt_json["data"]["name"].append(name_item)

        for price_item in dt[6].split(","):
            dt_json["data"]["price"].append(price_item)
            
        return dt_json
    
    return {"error": "取發文的內容出現錯誤"}