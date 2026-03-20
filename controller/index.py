from fastapi import *
from fastapi.responses import JSONResponse
from dbusing import db
from view.indexV import country_info, city_info, types_info, posts_marker_info, marker_posts_data, marker_posts_data_visitor, follow_user_info
from model.user_validation import jwtDecode
from decimal import Decimal

router = APIRouter()

@router.get("/api/countryname")
async def get_country_name():
    get_dt = await db.query_country_name()
    if isinstance(get_dt, list):
        dt_json = country_info(get_dt)
        return JSONResponse(dt_json)
    
    return JSONResponse({"error": "根據執行結果發生錯誤。"})

@router.get("/api/cityname")
async def get_city_name(country: str = None):
    if (country != None):
        get_dt = await db.query_city_name(country)
        if isinstance(get_dt, list):
            dt_json = city_info(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "根據執行結果發生錯誤。"})

@router.get("/api/typesname")
async def get_city_name(country: str = None, city: str = None):
    get_dt = await db.query_types_name(country, city)
    if isinstance(get_dt, list):
        dt_json = types_info(get_dt)
        return JSONResponse(dt_json)
        
    return JSONResponse({"error": "根據執行結果發生錯誤。"})

@router.get("/api/search/post")
async def search_post_info(country: str, city: str, types: str, lat: Decimal, lon: Decimal, keyword:str = None, km:int=1, session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            city_list = city.split(",")
            get_dt = await db.get_posts_info(country, city_list, types, keyword, lat, lon, km)
            if get_dt != False:
                dt_json = posts_marker_info(get_dt)
                return JSONResponse(dt_json)
    else:
        city_list = city.split(",")
        get_dt = await db.get_posts_info(country, city_list, types, keyword, lat, lon, km)
        if get_dt != False:
            dt_json = posts_marker_info(get_dt)
            return JSONResponse(dt_json)

    return JSONResponse({"error": "取貼文資料發生錯誤。"})

@router.get("/api/search/locate/post")
async def search_locate_post_info(lat: Decimal, lon: Decimal, types: str, keyword:str = None, km:int=1, session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_locate_posts_info(lat, lon, types, keyword, km)
            if get_dt != False:
                dt_json = posts_marker_info(get_dt)
                return JSONResponse(dt_json)
    else:
        get_dt = await db.get_locate_posts_info(lat, lon, types, keyword, km)
        if get_dt != False:
            dt_json = posts_marker_info(get_dt)
            return JSONResponse(dt_json)

    return JSONResponse({"error": "取定位相關的貼文資料發生錯誤。"})

@router.get("/api/marker/posts")
async def get_marker_posts(lat: Decimal, lon: Decimal, user_id: str=None, session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.marker_post_info(user_id, lat, lon)
            if get_dt != False:
                dt_json = marker_posts_data(get_dt)
                return JSONResponse(dt_json)
    else:
        get_dt = await db.marker_post_info_visitor(lat, lon)
        if get_dt != False:
            dt_json = marker_posts_data_visitor(get_dt)
            return JSONResponse(dt_json)

    return JSONResponse({"error": "取標記圖示的貼文資料發生錯誤。"})

@router.get("/api/search/own/post")
async def search_own_posts(country: str, city: str, types: str, lat: Decimal, lon: Decimal, user_id: int, search: str, km:int=1, session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            city_list = city.split(",")
            get_dt = await db.get_own_posts_info(country, city_list, types, lat, lon, user_id, search, km)
            if get_dt != False:
                dt_json = posts_marker_info(get_dt)
                return JSONResponse(dt_json)

    return JSONResponse({"error": "取貼文資料發生錯誤。"})

@router.get("/api/search/locate/own/post")
async def search_locate_own_posts(lat: Decimal, lon: Decimal, types: str, user_id: int, search: str, km:int=1, session_token: str=Cookie(None)):
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_own_locate_posts_info(lat, lon, types, user_id, search, km)
            if get_dt != False:
                dt_json = posts_marker_info(get_dt)
                return JSONResponse(dt_json)

    return JSONResponse({"error": "取定位的貼文資料發生錯誤。"})


@router.get("/api/user/followmember")
async def get_user_follow(user_id: str, session_token: str=Cookie(None)):
    if (session_token != None):
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            get_dt = await db.get_user_follow_info(user_id)
            if get_dt != False:
                dt_json = follow_user_info(get_dt)
                return JSONResponse(dt_json)
    
    return JSONResponse({"error": "取得追蹤的資料發生錯誤。"})