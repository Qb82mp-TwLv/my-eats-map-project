from fastapi import *
from fastapi.responses import JSONResponse
from model.dbusing import db
from typing import List
from model.user_validation import jwtDecode
from view.postV import post_content_data,edit_post_data
from decimal import Decimal
from datetime import datetime
import os, hashlib, boto3, asyncio

router = APIRouter()

@router.post("/api/posts")
async def post_rest_content(user_id:int = Form(...),rest_name:str = Form(...),rest_address:str = Form(...),
                            rest_country:str = Form(...),rest_city:str = Form(...),rest_lat:Decimal = Form(...),
                            rest_lon:Decimal = Form(...),rest_type:str = Form(...),rest_comment:str = Form(...),
                            rest_area:str = Form(""),rest_foodname:str = Form(...),rest_foodprice:str = Form(...),
                            image: list[UploadFile]=File(...), session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            img_judgment_result, img_name_list = await img_file_judgment(image)
            if "data" in img_judgment_result:
                try:
                    result = await db.post_comment_info(user_id, rest_name, rest_address, 
                                rest_country, rest_city, rest_lat, rest_lon, rest_type, 
                                rest_comment, rest_area, rest_foodname, 
                                rest_foodprice, img_judgment_result["data"])

                    if result == True:
                        img_backet_name = os.getenv("API_AWS_BUCKET_NAME")

                        i = 0
                        for img in image:
                            s3=boto3.client("s3")
                            s3.upload_fileobj(
                                Fileobj=img.file,
                                Bucket=img_backet_name,
                                Key="eatsmap/"+img_name_list[i],
                                ExtraArgs={"ContentType": img.content_type}
                            )
                            i+=1
                            await asyncio.sleep(0.1)

                        return JSONResponse({"ok": True})
                except Exception as e:
                    print(e)
                    return JSONResponse({"error": "建立發文過程中發生錯誤。"})

    return JSONResponse({"error": "建立發文過程中發生錯誤。"})

async def img_file_judgment(files):
    img_name_text = ""
    img_name_list = []
    try:
        i = 0
        for img in files:
            if not img.content_type.startswith("image/"):
                return {"error": "不是圖片類型的檔案"}, {"error": "發生錯誤"}
            else:
                img_size = await img.read()
                if len(img_size) > (5*1024*1024):
                    return {"error": "圖片檔案過大。"}, {"error": "發生錯誤"}
                img.file.seek(0)
                img_name, extension = os.path.splitext(img.filename)
                hash_name = hashlib.sha256(img_name.encode('utf-8')).hexdigest()[:10] + str(i)
                time_number = datetime.now().strftime("%Y%m%d%H%M%S")
                hash_img_name = f"mapImg_{time_number}_{hash_name}{extension}"
                
                i+=1

                img_name_list.append(hash_img_name)
                if (img_name_text == ""):
                    img_name_text += hash_img_name
                    continue

                img_name_text += ","+hash_img_name
                

        if (img_name_text != ""):
            return {"data" :img_name_text}, img_name_list
        
        return {"error": "判斷檔案的過程發生錯誤"}, {"error": "發生錯誤"}
    except Exception as e:
        print(e)
        return {"error": "判斷檔案的過程發生錯誤"}, {"error": "發生錯誤"}

# 在某一貼文的資訊
@router.get("/api/posts/{post_id}")
async def a_piece_of_post_content(post_id: int, user_id: int, using: str, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            
            if using == "show_in_member":
                post_dt = await single_post_content(post_id, user_id)
                await asyncio.sleep(0.1)
                return JSONResponse(post_dt)
            
            if using == "edit_post" and confirm_token["id"]==user_id:
                post_dt = await edit_user_post(post_id, user_id)
                return JSONResponse(post_dt)

    return JSONResponse({"error": "獲取一則貼文內容出現錯誤。"})


async def single_post_content(post_id: int, user_id: int):
    get_dt = await db.get_post_info(post_id, user_id)
    dt_json = post_content_data(get_dt)
    return dt_json


@router.post("/api/posts/{post_id}/likes")
async def post_like_count_action(post_id: int, user_id: int=Form(...), session_token: str=Cookie(None), background_tasks: BackgroundTasks=None):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            # 不需要回傳的值，所以不用等待
            background_tasks.add_task(db.post_like_action,user_id, post_id, "yes")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/api/posts/{post_id}/likes")
async def delete_post_like_count_action(post_id: int, user_id: int=Form(...), session_token: str=Cookie(None), background_tasks: BackgroundTasks=None):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            # 不需要回傳的值，所以不用等待
            background_tasks.add_task(db.post_like_action,user_id, post_id, "no")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/api/posts/{post_id}/favorites")
async def post_favorites_count_action(post_id: int, user_id: int=Form(...), session_token: str=Cookie(None), background_tasks: BackgroundTasks=None):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            # 不需要回傳的值，所以不用等待
            background_tasks.add_task(db.post_collect_action,user_id, post_id, "yes")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/api/posts/{post_id}/favorites")
async def delete_post_favorites_count_action(post_id: int, user_id: int=Form(...), session_token: str=Cookie(None), background_tasks: BackgroundTasks=None):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            # 不需要回傳的值，所以不用等待
            background_tasks.add_task(db.post_collect_action,user_id, post_id, "no")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/api/posts/{post_id}")
async def del_user_post(post_id: int, user_id: int=Form(...), img_list: List[str] = Form(..., alias="img_list[]"), session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            del_like = await db.del_user_post_like(post_id)
            del_collect = await db.del_user_post_collect(post_id)
            result = await db.del_user_post_info(post_id, user_id)

            if (result == True and del_like==True and del_collect == True):
                s3 = boto3.client("s3")
                backet_name = os.getenv("API_AWS_BUCKET_NAME")
                try:
                    for imgName in img_list:
                        s3.delete_object(
                            Bucket= backet_name,
                            Key="eatsmap/"+imgName
                        )
                    return JSONResponse({"ok": True})
                except Exception as e:
                    print(e)
            
    return JSONResponse({"error": "未成功刪除此貼文資料。"})                    
            
async def edit_user_post(post_id: int, user_id: int):
    get_dt = await db.get_edit_user_post(post_id, user_id)
    dt_json = edit_post_data(get_dt)
    return dt_json

@router.put("/api/posts/{post_id}")
async def save_edit_user_post(post_id:int ,user_id:int = Form(...),rest_name:str = Form(...),rest_address:str = Form(...),
                            rest_country:str = Form(...),rest_city:str = Form(...),rest_lat:Decimal = Form(None),
                            rest_lon:Decimal = Form(None),rest_type:str = Form(...),rest_comment:str = Form(...),
                            rest_area:str = Form(""),rest_foodname:str = Form(...),rest_foodprice:str = Form(...),
                            image: str= Form(...), del_image: list[str] = Form([], alias="del_image[]"), session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict) and confirm_token["id"]==user_id:
            result = await db.save_edit_post(post_id, user_id, rest_name, rest_address, 
                                rest_country, rest_city, rest_lat, rest_lon, rest_type, 
                                rest_comment, rest_area, rest_foodname, 
                                rest_foodprice, image)
            if result == True:
                # 刪除要被刪除的圖片
                s3 = boto3.client("s3")
                backet_name = os.getenv("API_AWS_BUCKET_NAME")
                try:
                    if (del_image != []):
                        for imgName in del_image:
                            s3.delete_object(
                                Bucket= backet_name,
                                Key="eatsmap/"+imgName
                            )
                    return JSONResponse({"ok": True})
                except Exception as e:
                    print(e)
    
    return JSONResponse({"error": "未成功更新貼文資料。"})

