from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from cryptography.hazmat.primitives import serialization
import jwt
import os


def jwtEncode(user_data):
    if isinstance(user_data, dict):
        load_dotenv()
        
        pem_key = os.getenv("API_PEM_KEY")
        if pem_key != None:
            pem_key_bytes = pem_key.encode('utf-8')
        else:
            pem_key_bytes = None

        try:
            # 讀取私鑰
            key_dt = []
            private_pem_path = os.getenv("API_PRIVATE_PEM")
            with open(private_pem_path , "r") as file:
                for line in file:
                    if "-----" not in line: 
                        key_dt.append(line.strip())
                        continue
                    if "END RSA PRIVATE KEY" in line:
                        new_line = "\n"+line
                        key_dt.append(new_line)
                        continue

                    key_dt.append(line)

            key_dt_string = "".join(key_dt)
            key_str_bytes = key_dt_string.encode("utf-8")

            private_key = serialization.load_pem_private_key(
                key_str_bytes,
                password=pem_key_bytes,
            )

            # 確保時間一致性，避免跨時區問題
            expiry_date = datetime.now(timezone.utc)+timedelta(days=1)
            user_data["exp"] = int(expiry_date.timestamp())

            encoded_dt = jwt.encode(user_data, private_key, algorithm="RS256")
            return encoded_dt
        except Exception as e:
            print(e)
            return False
        

def jwtDecode(token):
    try:
        load_dotenv()

        # 讀取私鑰
        key_dt = []
        public_pem_path = os.getenv("API_PUBLIC_PEM")
        with open(public_pem_path, "r") as file:
            for line in file:
                if "-----" not in line: 
                    key_dt.append(line.strip())
                    continue
                if "END PUBLIC KEY" in line:
                        new_line = "\n"+line
                        key_dt.append(new_line)
                        continue
                
                key_dt.append(line)

        key_dt_string = "".join(key_dt)
        key_str_bytes = key_dt_string.encode("utf-8")

        public_key = serialization.load_pem_public_key(
            key_str_bytes
        )

        user_data_json = jwt.decode(token, public_key, algorithms=["RS256"])
        return user_data_json
    except ExpiredSignatureError:
        print("效期已過")
        return False
    except InvalidTokenError:
        return False
    except Exception as e:
        print(e)
        return False
