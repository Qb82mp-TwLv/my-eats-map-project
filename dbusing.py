from DB.dbconnection import db_init
from mysql.connector import OperationalError

class db_interaction:
    def __init__(self):
        self.db_conf = db_init
        self.db_conf.connected()
        self.db_operate = self.db_conf.db_cnx()

    async def country_name_data(self):
        dt_info = False

        cursor = self.db_operate.cursor()
        # 使用DISTINCT可以去掉重複的值
        query_country = """SELECT DISTINCT country FROM `position_info`;"""
        cursor.execute(query_country)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_info = findAll
        if cursor is not None:
            cursor.close()

        return dt_info

    async def query_country_name(self):
        _result = False
        try:
            _result = await self.country_name_data()
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.country_name_data()
            except Exception:
                return False
        except Exception as e:
            print("query error,"+str(e))
            return False
        
        return _result
    
    async def city_name_data(self, country):
        dt_info = False

        cursor = self.db_operate.cursor()
        # 使用DISTINCT可以去掉重複的值
        query_city = """SELECT city FROM `position_info` WHERE country=%s;"""
        cursor.execute(query_city, (country,))
        findAll = cursor.fetchall()

        if findAll != []:
            dt_info = findAll
        if cursor is not None:
            cursor.close()

        return dt_info

    async def query_city_name(self, country):
        _result = False
        try:
            _result = await self.city_name_data(country)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.city_name_data(country)
            except Exception:
                return False
        except Exception as e:
            print("query error,"+str(e))
            return False
        
        return _result
    
    async def types_name_data(self):
        dt_info = False

        cursor = self.db_operate.cursor()
        # 使用DISTINCT可以去掉重複的值
        query_types = """SELECT types_name FROM `store_types`;"""
        cursor.execute(query_types)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_info = findAll
        if cursor is not None:
            cursor.close()

        return dt_info

    async def query_types_name(self):
        _result = False
        try:
            _result = await self.types_name_data()
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.types_name_data()
            except Exception:
                return False
        except Exception as e:
            print("query error,"+str(e))
            return False
        
        return _result
    
    async def save_user_data(self, user_data, hash_string):
        dt_info = False

        cursor = self.db_operate.cursor()
        query_user_email = """SELECT email FROM `member_info` WHERE LOWER(email)=LOWER(%s);"""
        cursor.execute(query_user_email, (user_data.email,))

        findOne = cursor.fetchone()
        if findOne is None:
            dt_info = True
            create_user_info = """INSERT INTO `member_info` (name, email, password_hash, nickname)
                                    VALUES (%s, %s, %s, %s);"""
            create_data = (user_data.name, user_data.email, hash_string, user_data.nickname)
            cursor.execute(create_user_info, create_data)

        if dt_info == True and cursor.rowcount == 1:
            self.db_operate.commit()
        else:
            self.db_operate.rollback()
            dt_info = False

        if cursor is not None:
            cursor.close()

        return dt_info

    async def sign_in_user(self, user_data, hash_string):
        _result = False
        try:
            _result = await self.save_user_data(user_data, hash_string)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.save_user_data(user_data, hash_string)
            except Exception:
                return False
        except Exception as e:
            print("sign in error,"+str(e))
            return False
        
        return _result
    
    async def query_user_data(self, user_email, hash_string):
        dt_info = False

        cursor = self.db_operate.cursor()
        query_user_info = """SELECT user_id, name, email, nickname FROM `member_info` WHERE email=%s AND password_hash=%s;"""
        query_data = (user_email, hash_string)

        cursor.execute(query_user_info, query_data)
        findOne = cursor.fetchone()

        if findOne is not None:
            dt_info = findOne

        if cursor is not None:
            cursor.close()
        return dt_info

    async def log_in_user(self, user_email, hash_string):
        _result = False
        try:
            _result = await self.query_user_data(user_email, hash_string)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_user_data(user_email, hash_string)
            except Exception:
                return False
        except Exception as e:
            print("log in error,"+str(e))
            return False
        
        return _result

    async def query_token_user(self, user_data):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        query_user_info = """SELECT user_id, name, email, nickname, headshot_img FROM `member_info`
                            WHERE user_id=%s AND name=%s AND email=%s AND nickname=%s;"""
        query_data = (user_data["id"], user_data["name"], user_data["email"], user_data["nickname"])

        cursor.execute(query_user_info, query_data)
        findOne = cursor.fetchone()

        if findOne != None:
            dt_json = findOne

        if cursor is not None:
            cursor.close()
        return dt_json

    async def verify_token_info(self, user_data):
        _result = False
        try:
            _result = await self.query_token_user(user_data)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_token_user(user_data)
            except Exception:
                return False
        except Exception as e:
            print("token error,"+str(e))
            return False
        
        return _result
    
    async def query_follows_count(self, user_id):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        query_follows = """SELECT COUNT(tracker_id) FROM `tracker_info`
                            WHERE user_id=%s;"""
        query_data = (user_id,)

        cursor.execute(query_follows, query_data)
        findOne = cursor.fetchone()

        if findOne != None:
            dt_json = findOne

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_user_follow_number(self, user_id):
        _result = False
        try:
            _result = await self.query_follows_count(user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_follows_count(user_id)
            except Exception:
                return False
        except Exception as e:
            print("follows number error,"+str(e))
            return False
        
        return _result
    
    async def query_fans_count(self, user_id):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        query_fans = """SELECT COUNT(user_id) FROM `tracker_info`
                            WHERE tracker_id=%s;"""
        query_data = (user_id,)

        cursor.execute(query_fans, query_data)
        findOne = cursor.fetchone()

        if findOne != None:
            dt_json = findOne

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_user_fans_number(self, user_id):
        _result = False
        try:
            _result = await self.query_fans_count(user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_fans_count(user_id)
            except Exception:
                return False
        except Exception as e:
            print("fans number error,"+str(e))
            return False
        
        return _result
    
    async def query_user_posts(self, user_id):
        dt_json = []
        
        cursor = self.db_operate.cursor()
        query_fans = """SELECT post_id, food_img FROM `posts_info` WHERE user_id=%s;"""
        query_data = (user_id,)

        cursor.execute(query_fans, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def user_posts_info(self, user_id):
        _result = False
        try:
            _result = await self.query_user_posts(user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_user_posts(user_id)
            except Exception:
                return False
        except Exception as e:
            print("user posts error,"+str(e))
            return False
        
        return _result
    
    async def query_user_collect(self, user_id):
        dt_json = []
        
        cursor = self.db_operate.cursor()
        query_collect = """SELECT post.post_id, post.food_img FROM `collect_info` AS coll
                        JOIN `posts_info` AS post ON coll.post_id = post.post_id 
                        WHERE coll.user_id=%s;"""
        query_data = (user_id,)

        cursor.execute(query_collect, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def user_collect_info(self, user_id):
        _result = False
        try:
            _result = await self.query_user_collect(user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_user_collect(user_id)
            except Exception:
                return False
        except Exception as e:
            print("user collect info error,"+str(e))
            return False
        
        return _result
    
    async def update_user_headshot(self, user_id, img_name):
        dt_json = False

        cursor = self.db_operate.cursor()
        upload_img = """UPDATE `member_info`
                        SET headshot_img=%s
                        WHERE user_id=%s;"""
        upload_data = (img_name, user_id)

        cursor.execute(upload_img, upload_data)

        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()


        if cursor is not None:
            cursor.close()
        return dt_json

    async def user_headshot_info(self, user_id, img_name):
        _result = False
        try:
            _result = await self.update_user_headshot(user_id, img_name)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.update_user_headshot(user_id, img_name)
            except Exception:
                return False
        except Exception as e:
            print("headshot update error,"+str(e))
            return False
        
        return _result
    
    async def update_member_data(self, user_data):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        upload_info = """UPDATE `member_info`
                        SET name=%s, nickname=%s
                        WHERE user_id=%s;"""
        upload_data = (user_data.name, user_data.nickname, user_data.id)

        cursor.execute(upload_info, upload_data)

        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    async def member_personal_info(self, user_data):
        _result = False
        try:
            _result = await self.update_member_data(user_data)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.update_member_data(user_data)
            except Exception:
                return False
        except Exception as e:
            print("user info update error,"+str(e))
            return False
        
        return _result

    async def update_password_data(self, hash_old_pw, new_pw, user_id):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        upload_info = """UPDATE `member_info`
                        SET password_hash=%s
                        WHERE user_id=%s AND password_hash=%s;"""
        upload_data = (new_pw, user_id, hash_old_pw)

        cursor.execute(upload_info, upload_data)

        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    async def member_password_update(self, hash_old_pw, new_pw, user_id):
        _result = False
        try:
            _result = await self.update_password_data(hash_old_pw, new_pw, user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.update_password_data(hash_old_pw, new_pw, user_id)
            except Exception:
                return False
        except Exception as e:
            print("pw update error,"+str(e))
            return False
        
        return _result
    
    async def query_post_data(self, post_id, user_id):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        query_post = """SELECT M.user_id, M.name, M.nickname, M.headshot_img, P.store_location, P.store_name,
                        P.food_img, P.food_name, P.food_price, P.food_comment, P.dining_area,
                        IFNULL(collect.c_count, 0) AS collect_total,
                        IFNULL(lk.l_count, 0) AS like_total,
                        co.post_id, lik.post_id 
                        FROM `posts_info` AS P 
                        LEFT JOIN `member_info` AS M ON P.user_id=M.user_id 
                        LEFT JOIN (
                            SELECT post_id, COUNT(*) AS c_count
                            FROM `collect_info`
                            GROUP BY post_id
                        ) AS collect ON P.post_id = collect.post_id 
                        LEFT JOIN (
                            SELECT post_id 
                            FROM `collect_info` 
                            WHERE user_id=%s
                        ) AS co ON P.post_id = co.post_id 
                        LEFT JOIN (
                            SELECT post_id, COUNT(*) AS l_count 
                            FROM `like_info`
                            GROUP BY post_id
                        ) AS lk ON P.post_id = lk.post_id 
                        LEFT JOIN (
                            SELECT post_id 
                            FROM `like_info` 
                            WHERE user_id=%s
                        ) AS lik ON P.post_id = lik.post_id 
                        WHERE P.post_id=%s;"""
        query_data = (user_id, user_id, post_id)

        cursor.execute(query_post, query_data)
        findOne = cursor.fetchone()

        if findOne != None:
            dt_json = findOne

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_post_info(self, post_id, user_id):
        _result = False
        try:
            _result = await self.query_post_data(post_id, user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_post_data(post_id, user_id)
            except Exception:
                return False
        except Exception as e:
            print("user post info error,"+str(e))
            return False
        
        return _result

    async def create_post_data(self, user_id, rest_name, rest_address, 
                               rest_country, rest_city, rest_lat, rest_lon, rest_type, 
                               rest_comment, rest_area, rest_foodname, 
                               rest_foodprice, img_text):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        create_post = """INSERT INTO `posts_info` (user_id, store_location, store_name, position_id, lat,
                        lon, food_img, food_name, food_price, food_comment, dining_area, types_id)
                        SELECT 
                            %s, %s, %s, pos.id, %s, %s, %s, %s, %s, %s, %s, type.types_id
                        FROM (SELECT 1) AS postinfo
                        LEFT JOIN `position_info` AS pos ON pos.country = %s AND pos.city = %s
                        LEFT JOIN `store_types` AS type ON type.types_name=%s"""
        create_data = (user_id, rest_address, rest_name, rest_lat, rest_lon, img_text, rest_foodname,
                      rest_foodprice, rest_comment, rest_area, rest_country, rest_city, rest_type)

        cursor.execute(create_post, create_data)
        
        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    async def post_comment_info(self, user_id, rest_name, rest_address, 
                               rest_country, rest_city, rest_lat, rest_lon,
                               rest_type, rest_comment, rest_area, rest_foodname, 
                               rest_foodprice, img_text):      
        _result = False
        try:
            _result = await self.create_post_data(user_id, rest_name, rest_address, 
                               rest_country, rest_city, rest_lat, rest_lon,
                               rest_type, rest_comment, rest_area, rest_foodname, 
                               rest_foodprice, img_text)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.create_post_data(user_id, rest_name, rest_address, 
                               rest_country, rest_city, rest_lat, rest_lon,
                               rest_type, rest_comment, rest_area, rest_foodname, 
                               rest_foodprice, img_text)
            except Exception as e:
                print("user post info error,"+str(e))
                return False
        except Exception as e:
            print("user post info error,"+str(e))
            return False
        
        return _result
        
    def add_or_del_like(self, user_id, post_id, action):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        action_like=""

        if action == "yes":
            action_like = """INSERT INTO `like_info` (user_id, post_id)
                            VALUES (%s, %s);"""
        if action == "no":
            action_like = """DELETE FROM `like_info` WHERE user_id=%s AND post_id=%s;"""

        like_data = (user_id, post_id)

        cursor.execute(action_like, like_data)      
        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    def post_like_action(self, user_id, post_id, action):  
        _result = False
        try:
            _result = self.add_or_del_like(user_id, post_id, action)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = self.add_or_del_like(user_id, post_id, action)
            except Exception as e:
                print("post like action error,"+str(e))
                return False
        except Exception as e:
            print("post like action error,"+str(e))
            return False
        
        return _result

    def add_or_del_collect(self, user_id, post_id, action):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        action_like=""

        if action == "yes":
            action_like = """INSERT INTO `collect_info` (user_id, post_id)
                            VALUES (%s, %s);"""
        if action == "no":
            action_like = """DELETE FROM `collect_info` WHERE user_id=%s AND post_id=%s;"""

        like_data = (user_id, post_id)

        cursor.execute(action_like, like_data)      
        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    def post_collect_action(self, user_id, post_id, action):  
        _result = False
        try:
            _result = self.add_or_del_collect(user_id, post_id, action)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = self.add_or_del_collect(user_id, post_id, action)
            except Exception as e:
                print("post collect action error,"+str(e))
                return False
        except Exception as e:
            print("post collect action error,"+str(e))
            return False
        
        return _result
    
    def add_or_del_follow(self, post_user_id, user_id, action):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        action_like=""
        follow_data = ""

        if action == "yes":
            action_like = """INSERT INTO `tracker_info` (user_id, tracker_id, tracker_name)
                            SELECT %s, %s, user.name
                            FROM `member_info` AS m
                            LEFT JOIN `member_info` AS user ON user.user_id=%s
                            GROUP BY user.user_id;"""
            follow_data = (user_id, post_user_id, post_user_id)
        if action == "no":
            action_like = """DELETE FROM `tracker_info` WHERE user_id=%s AND tracker_id=%s;"""
            follow_data = (user_id, post_user_id)

        cursor.execute(action_like, follow_data)      
        if cursor.rowcount == 1:
            self.db_operate.commit()
            dt_json = True
        else:
            self.db_operate.rollback()

        if cursor is not None:
            cursor.close()
        return dt_json

    def user_follow_action(self, post_user_id,user_id, action):  
        _result = False
        try:
            _result = self.add_or_del_follow(post_user_id,user_id, action)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = self.add_or_del_follow(post_user_id,user_id, action)
            except Exception as e:
                print("user follow action error,"+str(e))
                return False
        except Exception as e:
            print("user follow action error,"+str(e))
            return False
        
        return _result

    async def query_posts_data(self, country, city, types, keyword):
        dt_json = []
        
        cursor = self.db_operate.cursor()
        query_posts=""
        query_data=""
        # 只找經緯度沒有重複的貼文，且以第一個符合貼文進行撈取
        if (types != "全部種類" and keyword == None):
            query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                            WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                            AND post.types_id IN (SELECT types_id FROM `store_types` AS ty WHERE ty.types_name = %s) 
                            GROUP BY post.lat, post.lon;"""
            query_data = (country, city[0], city[1], city[2], types)
        if (types == "全部種類" and keyword == None):
            query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                            WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                            GROUP BY post.lat, post.lon;"""
            query_data = (country, city[0], city[1], city[2])
        if (types != "全部種類" and keyword != None):
            query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                            WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                            AND post.types_id IN (SELECT types_id FROM `store_types` AS ty WHERE ty.types_name = %s) 
                            AND post.store_name = %s GROUP BY post.lat, post.lon;"""
            query_data = (country, city[0], city[1], city[2], types, keyword)
        if (types == "全部種類" and keyword != None):
            query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                            WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                            AND post.store_name = %s GROUP BY post.lat, post.lon;"""
            query_data = (country, city[0], city[1], city[2], keyword)

        cursor.execute(query_posts, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_posts_info(self, country, city, types, keyword):
        _result = False
        try:
            _result = await self.query_posts_data(country, city, types, keyword)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_posts_data(country, city, types, keyword)
            except Exception as e:
                print("search post error,"+str(e))
                return False
        except Exception as e:
            print("search post error,"+str(e))
            return False
        
        return _result

    async def query_own_posts_data(self, country, city, types, user_id, search):
        dt_json = []
        
        cursor = self.db_operate.cursor()
        query_posts=""
        query_data=""
        # 只找經緯度沒有重複的貼文，且以第一個符合貼文進行撈取
        if (search == "own"):
            if (types != "全部種類"):
                query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                                WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                                AND post.types_id IN (SELECT types_id FROM `store_types` AS ty WHERE ty.types_name = %s) 
                                AND post.user_id=%s 
                                GROUP BY post.lat, post.lon;"""
                query_data = (country, city[0], city[1], city[2], types, user_id)
            if (types == "全部種類"):
                query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post 
                                WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                                AND post.user_id=%s 
                                GROUP BY post.lat, post.lon;"""
                query_data = (country, city[0], city[1], city[2], user_id)
        else:
            if (types != "全部種類"):
                query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post
                                LEFT JOIN (SELECT post_id FROM `collect_info` WHERE user_id=%s) AS coll ON post.post_id=coll.post_id
                                WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                                AND post.types_id IN (SELECT types_id FROM `store_types` AS ty WHERE ty.types_name = %s)
                                AND post.post_id=coll.post_id
                                GROUP BY post.lat, post.lon;"""
                query_data = (user_id, country, city[0], city[1], city[2], types)
            if (types == "全部種類"):
                query_posts = """SELECT MIN(post.post_id), post.lat, post.lon, MIN(post.food_img) FROM `posts_info` AS post
                                LEFT JOIN (SELECT post_id FROM `collect_info` WHERE user_id=%s) AS coll ON post.post_id=coll.post_id
                                WHERE post.position_id IN (SELECT id FROM `position_info` AS pos WHERE pos.country = %s AND (pos.city = %s OR pos.city = %s OR pos.city = %s)) 
                                AND post.post_id=coll.post_id
                                GROUP BY post.lat, post.lon;"""
                query_data = (user_id, country, city[0], city[1], city[2])
       
        cursor.execute(query_posts, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_own_posts_info(self, country, city, types, user_id, search):
        _result = False
        try:
            _result = await self.query_own_posts_data(country, city, types, user_id, search)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_own_posts_data(country, city, types, user_id, search)
            except Exception as e:
                print("search own post error,"+str(e))
                return False
        except Exception as e:
            print("search own post error,"+str(e))
            return False
        
        return _result

    async def query_marker_posts(self, user_id, lat, lon):
        dt_json = []
        
        cursor = self.db_operate.cursor()
        query_post = """SELECT p.post_id, m.user_id, m.name, m.nickname, m.headshot_img, 
                        p.store_name, p.food_img, p.food_name, p.food_price, p.food_comment, p.dining_area,
                        IFNULL(collect.c_count, 0) AS collect_total,
                        IFNULL(lk.l_count, 0) AS like_total,
                        co.post_id, li.post_id, follow.user_id
                        FROM `posts_info` AS p
                        LEFT JOIN `member_info` AS m ON m.user_id=p.user_id 
                        LEFT JOIN (
                            SELECT post_id, COUNT(*) AS c_count
                            FROM `collect_info`
                            GROUP BY post_id
                        ) AS collect ON p.post_id = collect.post_id
                        LEFT JOIN (
                            SELECT post_id, COUNT(*) AS l_count
                            FROM `like_info`
                            GROUP BY post_id
                        ) AS lk ON p.post_id=lk.post_id
                        LEFT JOIN (
                            SELECT post_id
                            FROM `collect_info`
                            WHERE user_id=%s
                            GROUP BY post_id
                        ) AS co ON p.post_id=co.post_id
                        LEFT JOIN (
                            SELECT post_id
                            FROM `like_info`
                            WHERE user_id=%s
                            GROUP BY post_id
                        ) AS li ON p.post_id=li.post_id
                        LEFT JOIN (
                            SELECT user_id, tracker_id
                            FROM `tracker_info`
			                GROUP BY user_id, tracker_id
                        ) AS follow ON p.user_id=follow.tracker_id AND follow.user_id=%s
                        WHERE lat=%s AND lon=%s;"""
        query_data = (user_id, user_id, user_id, lat, lon)

        cursor.execute(query_post, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def marker_post_info(self, user_id, lat, lon):
        _result = False
        try:
            _result = await self.query_marker_posts(user_id, lat, lon)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_marker_posts(user_id, lat, lon)
            except Exception as e:
                print("marker post error,"+str(e))
                return False
        except Exception as e:
            print("marker post error,"+str(e))
            return False
        
        return _result

    async def query_user_follow_data(self, user_id):
        dt_json = False
        
        cursor = self.db_operate.cursor()
        query_info = """SELECT tracker_id, tracker_name FROM `tracker_info` WHERE user_id=%s;"""
        query_data = (user_id,)

        cursor.execute(query_info, query_data)
        findAll = cursor.fetchall()

        if findAll != []:
            dt_json = findAll

        if cursor is not None:
            cursor.close()
        return dt_json

    async def get_user_follow_info(self, user_id):
        _result = False
        try:
            _result = await self.query_user_follow_data(user_id)
        except OperationalError:
            self.db_conf.restart_connect()
            try:
                _result = await self.query_user_follow_data(user_id)
            except Exception as e:
                print("marker post error,"+str(e))
                return False
        except Exception as e:
            print("marker post error,"+str(e))
            return False
        
        return _result

db = db_interaction()