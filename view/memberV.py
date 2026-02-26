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
        for id, img in dt:
            post_id_list.append(id)

            split_img = img.split(",")
            img_list.append(split_img[0])
            
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
        for id, img in dt:
            collect_id_list.append(id)
            split_img = img.split(",")
            img_list.append(split_img[0])
            
        if img_list != []:
            dt_json["data"]["image"]=img_list
        
        dt_json["data"]["post_id"] = collect_id_list
        return dt_json
    
    return {"error": "收藏的資料發生錯誤"}
