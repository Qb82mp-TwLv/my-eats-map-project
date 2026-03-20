from dotenv import load_dotenv
import os

def user_follows_people(dt):
    if type(dt) != bool:
        return {"data": {
            "count": dt[0]
        }}

    return {"error": "取追蹤人數出現錯誤"}

def user_fans_people(dt):
    if type(dt) != bool:
        return {"data": {
            "count": dt[0]
        }}

    return {"error": "取粉絲人數出現錯誤"}

def user_posts_data(dt):
    if type(dt) != bool:
        dt_json = {
            "data":{
                "post_id":[],
                "image": []
            }
        }
        if dt == []:
            return {"data":"無資料"}

        post_id_list = []
        img_list = []
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        for id, img in dt:
            post_id_list.append(id)

            split_img = img.split(",")
            imgUrl = url+split_img[0]
            img_list.append(imgUrl)
            
        if img_list != []:
            dt_json["data"]["image"]=img_list
        
        dt_json["data"]["post_id"] = post_id_list
        return dt_json
    
    return {"error": "發文的資料發生錯誤"}

def user_collect_data(dt):
    if type(dt) != bool:
        dt_json = {
            "data":{
                "post_id":[],
                "image": []
            }
        }

        if dt == []:
            return {"data":"無資料"}

        collect_id_list = []
        img_list = []
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        for id, img in dt:
            collect_id_list.append(id)

            split_img = img.split(",")
            imgUrl = url+split_img[0]
            img_list.append(imgUrl)
            
        if img_list != []:
            dt_json["data"]["image"]=img_list
        
        dt_json["data"]["post_id"] = collect_id_list
        return dt_json
    
    return {"error": "收藏的資料發生錯誤"}

def other_member_info(dt):
    if dt != False:
        dt_json = {
            "data": {
                "id": dt[0],
                "name": dt[1],
                "nickname": dt[2],
                "headshot": dt[3]
            }
        }
        return dt_json
    
    return {"data": None}

def fans_member_info(dt):
    load_dotenv()
    CDN_path = os.getenv("API_AWS_CDN_PATH")
    url = f"{CDN_path}/"

    dt_json = {
        "data": []
    }

    if dt != False:
        for item in dt:
            follow_result = "no" if item[3] == None else "yes"

            if item[2] != None:
                member_headshot = url+item[2]
            else:
                member_headshot = item[2]

            dt_json["data"].append({
                    "id": item[0],
                    "name": item[1],
                    "headshot": member_headshot,
                    "follow": follow_result
                })
        return dt_json
    
    return {"data": None}