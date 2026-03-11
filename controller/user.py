from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from dbusing import db
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from view.loginV import signin_info, login_info, verify_user_info
from view.memberV import user_follows_people, user_fans_people, user_posts_data, user_collect_data
from view.get_image import get_CDN_image, clear_CDN_cache
from model.user_validation import jwtDecode
from datetime import datetime
import re, os, hashlib, boto3, asyncio


router = APIRouter()
oauth2 = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

class sign_in_info(BaseModel):
    name: str
    email: str
    password: str
    nickname: str

@router.post("/api/user")
async def sign_in(user_data: sign_in_info):
    # 驗證電子信箱格式
    email_pattern = r'[A-Za-z]+[A-Za-z0-9]+([_.][A-Za-z0-9]+)*\@[A-Za-z0-9]+(\.[A-Za-z]+)+'
    if re.fullmatch(email_pattern, user_data.email) and \
        (len(user_data.email) <= 254) and (len(user_data.name) <= 100) and \
        (len(user_data.password) < 100) and (len(user_data.nickname) <= 30):
        load_dotenv()
        # 將密碼加密
        pw_salt = os.getenv("API_PW_SALT")
        pw_hash = user_data.password + pw_salt
        hash_string = hashlib.sha256(pw_hash.encode('utf-8')).hexdigest()

        signin_dt = await db.sign_in_user(user_data, hash_string)
        if (signin_dt == True):
            dt_json = signin_info(signin_dt)
            return JSONResponse(dt_json)
        
        return JSONResponse({"error": "根據執行結果發生錯誤。"})
    
class log_in_info(BaseModel):
    email: str
    password: str

@router.put("/api/user/auth")
async def log_in(user_data: log_in_info, response: Response):
    email_pattern = r'[A-Za-z]+[A-Za-z0-9]+([_.][A-Za-z0-9]+)*\@[A-Za-z0-9]+(\.[A-Za-z]+)+'
    if re.fullmatch(email_pattern, user_data.email) and (len(user_data.email) <= 254) and (len(user_data.password) < 100):
        # 將密碼加密
        load_dotenv()
        pw_salt = os.getenv("API_PW_SALT")
        pw_hash = user_data.password + pw_salt
        hash_string = hashlib.sha256(pw_hash.encode('utf-8')).hexdigest()

        login_dt = await db.log_in_user(user_data.email, hash_string)
        dt_json = login_info(login_dt)
        if (dt_json.get("token") is not None):
            token = dt_json["token"]

            # 設定HttpOnly cookie
            response.set_cookie(
                key="session_token",
                value=token,
                httponly=True,
                secure=False,      # 本端開發測試用
                samesite="lax",    
                path="/"
            ) 

            return {"ok": "True"}
    
    return JSONResponse({"error": True})

@router.get("/api/user/auth")
async def confirm_user_info(session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.verify_token_info(confirm_token)
            dt_json = verify_user_info(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"data": None})

@router.post("/api/user/logout")
def log_out(response: Response):
    # 刪除HttpOnly Cookie
    response.delete_cookie(
        key="session_token",
        path="/"
    )

    return {"logOut": True}

# 取得追蹤的人數
@router.get("/api/user/follow")
async def get_user_follows(user_id: int, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_user_follow_number(user_id)
            dt_json = user_follows_people(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取追蹤人數出現錯誤"})

# 取得粉絲的人數
@router.get("/api/user/fans")
async def get_user_fans(user_id: int, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_user_fans_number(user_id)
            dt_json = user_fans_people(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取粉絲人數出現錯誤"})

@router.get("/api/user/posts")
async def get_user_posts(user_id: int, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.user_posts_info(user_id)
            await clear_CDN_cache()
            dt_json = user_posts_data(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取發文所有的貼文部分發生錯誤"})

@router.get("/api/user/collect")
async def get_user_posts(user_id: int, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.user_collect_info(user_id)
            dt_json = user_collect_data(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取收藏所有的貼文部分發生錯誤"})

@router.get("/api/user/headshoturl")
async def get_user_headshot_url(headshot_name: str, session_token: str=Cookie(None)):
    try:
        if (session_token != None):
            confirm_token = jwtDecode(session_token)
            if isinstance(confirm_token, dict):
                load_dotenv()
                CDN_path = os.getenv("API_AWS_CDN_PATH")
                url = f"{CDN_path}/"

                await clear_CDN_cache()
                imgUrl = url+headshot_name

                await asyncio.sleep(0.1)
                return JSONResponse({"data": {
                    "img": imgUrl
                }})
        return JSONResponse({"data": None})
    except Exception as e:
        print("大頭照: %s",str(e))
        return JSONResponse({"data": None})

@router.post("/api/user/headshot")
async def upload_headshot_img(user_id: int=Form(), headshot: str=Form(None), image: UploadFile=File(...), session_token: str=Cookie(None)):
    load_dotenv()
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            try:
                img_name, extension = os.path.splitext(image.filename)
                hash_name = hashlib.sha256(img_name.encode('utf-8')).hexdigest()[:7]
                time_number = datetime.now().strftime("%Y%m%d%H%M%S")
                headshot_name = f"mapImg_{time_number}_{hash_name}{extension}"

                if not image.content_type.startswith("image/"):
                    return JSONResponse({"error": "不是圖片類型的檔案"})
                else:
                    img_size = await image.read()
                    if len(img_size) > (5*1024*1024):
                        return JSONResponse({"error": "圖片檔案過大。"})
                    image.file.seek(0)

                    _result = False
                    if "mapImg_" in headshot:
                        headshot_name = headshot
                        await clear_CDN_cache()
                        _result = True
                    else:
                        _result = await db.user_headshot_info(user_id, headshot_name)

                    if _result != False:
                        img_backet_name = os.getenv("API_AWS_BUCKET_NAME")
                        s3=boto3.client("s3")
                        s3.upload_fileobj(
                            Fileobj=image.file,
                            Bucket=img_backet_name,
                            Key="eatsmap/"+headshot_name,
                            ExtraArgs={"ContentType": image.content_type}
                        )
                        dt_json = await get_CDN_image(headshot_name)
                        return JSONResponse(dt_json)
                    
                return JSONResponse({"error": "更換大頭照發生錯誤"})
            except Exception as e:
                print(e)
                return JSONResponse({"error": "更換大頭照發生錯誤"})

class member_save_info(BaseModel):
    id: int
    name: str
    nickname: str

@router.patch("/api/user/infoupdate")
async def save_user_info(member_info: member_save_info, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict) and confirm_token["id"]== member_info.id:
            update_dt = await db.member_personal_info(member_info)
            if (update_dt == True):
                return JSONResponse({"ok": True})

    return JSONResponse({"error": "執行會員資料更新發生錯誤"})

class member_save_pw(BaseModel):
    id: int
    oldpassword: str
    newpassword: str

@router.patch("/api/uer/updatepw")
async def save_user_pw(member_pw: member_save_pw, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict) and confirm_token["id"]== member_pw.id :
            # 將原密碼加密，確認是否與使用者一樣
            load_dotenv()
            pw_salt = os.getenv("API_PW_SALT")
            # 先將原密碼加密
            old_pw_hash = member_pw.oldpassword + pw_salt
            old_hash_string = hashlib.sha256(old_pw_hash.encode('utf-8')).hexdigest()
            # 將新密碼加密
            new_pw_hash = member_pw.newpassword + pw_salt
            new_hash_string = hashlib.sha256(new_pw_hash.encode('utf-8')).hexdigest()
        
            update_dt = await db.member_password_update(old_hash_string, new_hash_string, member_pw.id)
            if (update_dt == True):
                return JSONResponse({"ok": True})

    return JSONResponse({"error": "密碼更新發生錯誤"})

