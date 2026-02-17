from DB.dbconnection import connection_database
from mysql.connector import OperationalError

class db_interaction:
    def __init__(self):
        self.db_conf = connection_database()
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