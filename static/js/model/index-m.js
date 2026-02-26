class indexModel {
    constructor() {
        this.countryItem = document.querySelector(".country-droplist");
        this.cityItem = document.querySelector(".city-droplist");
        this.typeItem = document.querySelector(".types-droplist");
    
        // 點擊選項，會顯示在此框中
        this.countrySelect = document.querySelector(".country-select");
        this.citySelect = document.querySelector(".city-select");
        this.typesSelect = document.querySelector(".types-select");
    
        // this.cityArr;
        this.mapkey = "";

        this.viewPosts = document.querySelector(".view-posts");
        this.closePostsDialogBtn = document.querySelector(".close-btn");
        if (this.closePostsDialogBtn){
            this.closePostsDialogBtn.addEventListener("click", () => {
                this.viewPosts.close();
            });
        }

        // 經緯度變數
        this.lat;
        this.lon;

        this.options={
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge:0
        };
    };

    citySelectText() {
        this.citySelect.textContent = "選擇城市";
    }

    async getCountryOptionName() {
        const response = await fetch("/api/countryname", {method: "GET"});
        const dt = await response.json();

        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
        }else{
            return dt;
        } 
    }

    async getCityOptionName(country) {
        const response = await fetch(`/api/cityname?country=${country}`, {
            method: "GET",
        });
        const dt = await response.json();

        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
            return {"city":[]};
        }else{
            return dt.data;
        } 
    }

    async getTypesOptionName() {
        const response = await fetch(`/api/typesname`, {
            method: "GET",
        });
        const dt = await response.json();

        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
        }else{
            return dt;
        } 
    };

    countryOptionClick() {
        if (this.countryItem && this.cityItem && this.typeItem){
            this.cityItem.classList.remove('active');
            this.typeItem.classList.remove('active');
            this.countryItem.classList.toggle('active');
            return;
        }
        console.log("抱歉，找不到選擇地區的物件。");
    };

    cityOptionClick() {
        if (this.cityItem && this.countryItem && this.typeItem){
            this.typeItem.classList.remove('active');
            this.countryItem.classList.remove('active');
            this.cityItem.classList.toggle('active');
            return;
        }
        console.log("抱歉，找不到選擇城市的物件。");
    };

    typeOptionClick() {
        if (this.typeItem && this.cityItem && this.countryItem){
            this.countryItem.classList.remove('active');
            this.cityItem.classList.remove('active');
            this.typeItem.classList.toggle('active');
            return;
        }

        console.log("抱歉，找不到選擇店家種類的物件。");
    };

    // 有問題，之後再修正
    droplistOptionHidden() {
        if (this.countryItem && this.countryItem.classList.contains('active')){
            this.countryItem.classList.remove('active');
        }

         if (this.cityItem && this.cityItem.classList.contains('active')){
            this.cityItem.classList.remove('active');
        }

        if (this.typeItem && this.typeItem.classList.contains('active')){
            this.typeItem.classList.remove('active');
        }
    };

    // countryOptionItemClick(optionTag) {
        
    // };

    cityOptionItemClick(optionTag) {
        optionTag.addEventListener("click", () => {
            this.citySelect.textContent = optionTag.textContent;
        });
    };

    typesOptionItemClick(optionTag) {
        optionTag.addEventListener("click", () => {
            this.typesSelect.textContent = optionTag.textContent;
        });
    }

    async getMapValue() { 
        try{
            const response = await fetch("/api/mapvalue");
            const value = await response.json();

            if (!response.ok || value.error!== undefined){
                console.log("地圖發生錯誤。");
            }else{
                this.mapkey = value.data;
            }
        }catch{
            console.log("地圖發生錯誤。");
        };

        return this.mapkey;
    }

    async getMapId() {
        let mapid = "";
        try{
            const response = await fetch("/api/mapid");
            const value = await response.json();

            if (!response.ok || value.error!== undefined){
                console.log("地圖發生錯誤。");
            }else{
                mapid = value.data;
            }
        }catch{
            console.log("地圖發生錯誤。");
        };

        return mapid;
    }

    async searchPosition(country, city) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${country},${city}&key=${this.mapkey}`
        try{
            const response = await fetch(url);
            const posData = await response.json();
            if (posData.status === "OK"){
                const {lat, lng} = posData.results[0].geometry.location;
                return {lat, lng};
            }else{
                console.log("找不到定位點。");
            }
        }catch{
            console.log("定位發生錯誤。");
        };

        return {lat: "nan", lng: "nan"};
    }

    async openPostsContent() {
        if (this.viewPosts){
            this.viewPosts.showModal();
        }
    }

    async get_position_func(position) {
        const lat_pos = position.coords.latitude;
        const lon_pos = position.coords.longitude;
        console.log(`緯度：${lat_pos}，經度：${lon_pos}`);
        alert(`成功取得位置！\n緯度：${lat_pos}\n經度：${lon_pos}`);
    }

    async get_position_error(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.error("使用者拒絕使用定位功能");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("無取取得定位位置");
                break;
            case error.TIMEOUT:
                console.error("取得定位的請求超時了");
                break;
            case error.UNKNOWN_ERROR:
                console.error("發生其他錯誤");
                break;
        }
    };

}

const indexM = new indexModel();
export default indexM;