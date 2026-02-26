from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from dbusing import db
from pydantic import BaseModel
from typing import Optional
from model.user_validation import jwtDecode
from view.postV import post_content_data
from decimal import Decimal
import os, hashlib, datetime, boto3

router = APIRouter()
oauth2 = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

@router.post("/api/post/single")
async def post_rest_content(user_id: int=Form(), rest_name: str=Form(), rest_address: str=Form(), rest_country: str=Form()
                            , rest_city: str=Form(), rest_lat: Decimal=Form(), rest_lon: Decimal=Form(), rest_type: str=Form(), rest_comment: str=Form()
                            , rest_area: str=Form(), rest_foodname: str=Form(), rest_foodprice: str=Form()
                            , image: UploadFile=File(...), token: Optional[str]=Depends(oauth2)):
    if (token != None):
        confirm_token = jwtDecode(token)
        if isinstance(confirm_token, dict):
            img_judgment_result, img_name_list = await img_file_judgment(image)
            if "data" in img_judgment_result:
                try:
                    result = await db.post_comment_info(user_id, rest_name, rest_address, 
                                rest_country, rest_city, rest_lat, rest_lon, rest_type, 
                                rest_comment, rest_area, rest_foodname, 
                                rest_foodprice, img_judgment_result)
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

                        return JSONResponse({"ok": True})
                except Exception:
                    return JSONResponse({"error": "建立發文過程中發生錯誤"})

    return JSONResponse({"error": "建立發文過程中發生錯誤"})

async def img_file_judgment(files):
    img_name_text = ""
    img_name_list = []
    try:
        for img in files:
            if not img.content_type.startswith("image/"):
                return {"error": "不是圖片類型的檔案"}
            else:
                img_size = await img.read()
                if len(img_size) > (5*1024*1024):
                    return {"error": "圖片檔案過大。"}
                img.file.seek(0)

                img_name, extension = os.path.splitext(img.filename)
                hash_name = hashlib.sha256(img_name.encode('utf-8')).hexdigest()[:7]
                time_number = datetime.now().strftime("%Y%m%d%H%M%S")
                hash_img_name = f"mapImg_{time_number}_{hash_name}{extension}"

                img_name_list.append(hash_img_name)
                if (img_name_text == ""):
                    img_name_text += hash_img_name
                    continue

                img_name_text += ","+hash_img_name
        if (img_name_text != ""):
            return img_name_text, img_name_list
        
        return {"error": "判斷檔案的過程發生錯誤"}
    except Exception:
        return {"error": "判斷檔案的過程發生錯誤"}


@router.get("/api/post/single")
async def single_post_content(post_id: int, token: Optional[str]=Depends(oauth2)):
    if (token != None):
        confirm_token = jwtDecode(token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_post_info(post_id)
            dt_json = post_content_data(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取發文的內容出現錯誤"})