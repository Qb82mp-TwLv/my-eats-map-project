from fastapi import *
from fastapi.responses import JSONResponse
from model.dbusing import db
from view.indexV import country_info, city_info, types_info, posts_marker_info, marker_posts_data, marker_posts_data_visitor
from model.user_validation import jwtDecode
from decimal import Decimal

router = APIRouter()

@router.get("/api/country")
async def get_country_name():
    get_dt = await db.query_country_name()
    if isinstance(get_dt, list):
        dt_json = country_info(get_dt)
        return JSONResponse(dt_json)
    
    return JSONResponse({"error": "取得地區資料發生錯誤。"})

@router.get("/api/city")
async def get_city_name(country: str = None):
    if (country != None):
        get_dt = await db.query_city_name(country)
        if isinstance(get_dt, list):
            dt_json = city_info(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取得城市資料發生錯誤。"})

@router.get("/api/types")
async def get_city_name(country: str = None, city: str = None):
    get_dt = await db.query_types_name(country, city)
    if isinstance(get_dt, list):
        dt_json = types_info(get_dt)
        return JSONResponse(dt_json)
        
    return JSONResponse({"error": "取得店家種類資料發生錯誤。"})

@router.get("/api/posts")
async def search_posts(lat: Decimal, lon: Decimal, using:str, search: str=None, country: str=None, city: str=None, types: str="全部種類", keyword:str = None, km:int=1, user_id: str=None, session_token: str=Cookie(None)):
    if using == "search_by_city":
        posts_dt = await search_post_info(country, city, types, lat, lon, keyword, km)
        return JSONResponse(posts_dt)

    if using == "search_by_geographic":
        posts_dt = await search_geographic_post_info(lat, lon, types, keyword, km)
        return JSONResponse(posts_dt)
    
    login_status = False
    if session_token != None:
        confirm_token = jwtDecode(session_token)
        if isinstance(confirm_token, dict):
            login_status = True

    if using == "search_by_marker":
        posts_dt = await get_marker_posts(lat, lon, login_status, user_id)
        return JSONResponse(posts_dt)
    
    if using == "search_by_own" and login_status == True:
        if country != None and city != None:
            posts_dt = await search_own_posts(country, city, types, lat, lon, user_id, search, km)
            return JSONResponse(posts_dt)
        else:
            posts_dt = await search_locate_own_posts(lat, lon, search, types, user_id, km)
            return JSONResponse(posts_dt)
        
    
async def search_post_info(country: str, city: str, types: str, lat: Decimal, lon: Decimal, keyword:str = None, km:int=1):
    city_list = city.split(",")
    get_dt = await db.get_posts_info(country, city_list, types, keyword, lat, lon, km)
    if get_dt != False:
        dt_json = posts_marker_info(get_dt)
        return dt_json
    else:
        return {"error": "取貼文資料發生錯誤。"}


async def search_geographic_post_info(lat: Decimal, lon: Decimal, types: str, keyword:str = None, km:int=1):
    get_dt = await db.get_locate_posts_info(lat, lon, types, keyword, km)
    if get_dt != False:
        dt_json = posts_marker_info(get_dt)
        return dt_json
    else:
        return {"error": "取定位相關的貼文資料發生錯誤。"}


async def get_marker_posts(lat: Decimal, lon: Decimal, login_status: bool, user_id: str=None):
    if login_status == True:
        get_dt = await db.marker_post_info(user_id, lat, lon)
        if get_dt != False:
            dt_json = marker_posts_data(get_dt)
            return dt_json
    else:
        get_dt = await db.marker_post_info_visitor(lat, lon)
        if get_dt != False:
            dt_json = marker_posts_data_visitor(get_dt)
            return dt_json

    return {"error": "取標記圖示的貼文資料發生錯誤。"}


async def search_own_posts(country: str, city: str, types: str, lat: Decimal, lon: Decimal, user_id: int, search: str, km:int=1):
    city_list = city.split(",")
    get_dt = await db.get_own_posts_info(country, city_list, types, lat, lon, user_id, search, km)
    if get_dt != False:
        dt_json = posts_marker_info(get_dt)
        return dt_json
    else:
        return {"error": "取貼文資料發生錯誤。"}


async def search_locate_own_posts(lat: Decimal, lon: Decimal, search: str, types: str, user_id: int, km:int=1):
    get_dt = await db.get_own_locate_posts_info(lat, lon, search, types, user_id, km)
    if get_dt != False:
        dt_json = posts_marker_info(get_dt)
        return dt_json
    else:
        return {"error": "取定位的貼文資料發生錯誤。"}


