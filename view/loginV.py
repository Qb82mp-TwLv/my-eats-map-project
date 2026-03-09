from model.user_validation import jwtEncode


def signin_info(dt):
    try:
        return {"ok": dt}
    except Exception:
        return {"error": True}
    
def login_info(dt):
    if dt != False:
        try:
            dt_json = {"id": dt[0], "name": dt[1], "email": dt[2], "nickname": dt[3]}
            _get_token = jwtEncode(dt_json)
            if isinstance(_get_token, bool):
                return {"error": True}
            else:
                _token = {"token": _get_token}
                return _token
        except Exception:
            return {"error": True}
    else:
        return {"error": True}
    
def verify_user_info(dt):
    if dt != False:
        dt_json = {
            "data": {
                "id": dt[0],
                "name": dt[1],
                "email": dt[2],
                "nickname": dt[3],
                "headshot": dt[4]
            }
        }
        return dt_json
    
    return {"data": None}