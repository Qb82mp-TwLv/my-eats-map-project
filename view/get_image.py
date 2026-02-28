from dotenv import load_dotenv
import os, boto3, time

async def get_CDN_image(img_name):
    try:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/"

        imgUrl = url+img_name

        return {"data": {
            "img": imgUrl
        }}
    except Exception:
        return {"error", "取圖片檔案的網址發生錯誤"}
    
async def get_Post_CDN_image(img_name):
    url_list=[]
    try:
        load_dotenv()
        CDN_path = os.getenv("API_AWS_CDN_PATH")
        url = f"{CDN_path}/eatsmap/"

        imgUrl = url+img_name
        url_list.append(imgUrl)

        if url_list != []:
            return {"data": {
                "img": url_list
            }}
        return {"error", "取圖片檔案的網址發生錯誤"}
    except Exception:
        return {"error", "取圖片檔案的網址發生錯誤"}
    
async def clear_CDN_cache():
    load_dotenv()
    disId = os.getenv("API_AWS_CDN_DIS")

    cdn = boto3.client("cloudfront")

    timename = int(time.time())
    response = cdn.create_invalidation(
        DistributionId=disId,
        InvalidationBatch={
            'Paths':{
                'Quantity': 1,
                'Items': ['/*']
            },
            'CallerReference': f"clear-{str(timename)}"
        }
    )
    
    # invalidation_id = response["Invalidation"]['Id']
    # clear_wait = cdn.get_waiter('invalidation_completed')
    # clear_wait.wait(
    #     DistributionId=disId,
    #     Id = invalidation_id,
    #     WaiterConfig={"Delay": 20, "MaxAttemps": 30}
    # )
