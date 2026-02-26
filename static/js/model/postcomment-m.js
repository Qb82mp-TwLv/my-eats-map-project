class postCommentModel {
    constructor() {
        // 點擊選項，會顯示在此框中
        this.countrySelect = document.querySelector(".country-select");
        this.citySelect = document.querySelector(".city-select");
        this.typesSelect = document.querySelector(".type-select");

        this.countryItem = document.querySelector(".country-droplist");
        this.cityItem = document.querySelector(".city-droplist");
        this.typeItem = document.querySelector(".type-droplist");

        // 取得選取的圖片
        this.imgFiles=null;
        // 取得form物件
        this.formObj = document.querySelector(".food-block");
        // 取得其他物件
        this.restNameText = document.querySelector(".rest-name-text");
        this.addressText = document.querySelector(".address-text");
        this.commentInfoText = document.querySelector(".comment-info");
        this.diningAreaInfoText = document.querySelector(".dining-area-info");
    
        this.mapkey="";
        this.getMapValue();
    }

    async memberCenter() {
        window.location.href = "/member";
    }

    async homePage() {
        window.location.href = "/eatsmap";
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

    citySelectText() {
        this.citySelect.textContent = "選擇城市";
    }

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

    // changeImg() {
    //     const fileUpload = document.getElementById("image-upload");
    //     const maxImgFileSum = 7;
    //     fileUpload.addEventListener("change", function(e) {
    //         console.log(this.files.length);
    //         if (this.files.length > maxImgFileSum){
    //             this.value="";
    //             alert("最多只能選取7張圖，請重新選擇。");
    //             return;
    //         }

    //         if (this.files.length > 0){
    //             this.imgFiles = this.files;
    //         }else{
    //             this.imgFiles = null;
    //         }

    //         return this.files;
    //     });
    // };

    joinText(arr) {
        const textAdd = "";
        for (let i=0; i < arr.length; i++){
            textAdd += String(arr[i]);
        }

        return textAdd;
    }

    async submitPostInfo(id) {
        const token = localStorage.getItem("token");
        // 先取得圖片
        if (this.imgFiles !== null){
            try{
                const imgFilesLength = this.imgFiles.length;
                console.log(`輸入數量:${imgFilesLength}`);
                const foodNameAndPriceObjLength = this.formObj.querySelectorAll("input").length;
                console.log(`輸入數量:${foodNameAndPriceObjLength}`);
                if ((foodNameAndPriceObjLength % 2) !== 0){
                    return "請根據新增的圖片數量，新增對應的餐點名稱與價格。";
                }

                const foodInfoObjRowLength = (foodNameAndPriceObjLength / 2);
                if (imgFilesLength !== foodInfoObjRowLength){
                    return "請根據新增的圖片數量，新增對應的餐點名稱與價格。";
                }

                const formArr = new FormData(this.formObj);
                // 取得input name的方式，撈取所有的值
                const foodNameArr = formArr.getAll("nametext");
                const foodPriceArr = formArr.getAll("pricetext");
                const foodNameText = this.joinText(foodNameArr);
                const foodPriceText = this.joinText(foodPriceArr);

                // 取得其他值
                const restaurantName = this.restNameText.value.trim();
                const restaurantAddress = this.addressText.value.trim();
                const restaurantCountry = this.countrySelect.textContent;
                const restaurantCity = this.citySelect.textContent;
                const restaurantTypes = this.typesSelect.textContent;
                const restaurantComment = this.commentInfoText.value;
                const restaurantArea = this.diningAreaInfoText.value;

                // 取得地址的經緯度
                const addCoordinate = await this.getAddressCoordinates(restaurantAddress);
                if (addCoordinate === "error"){
                    return "建立貼文失敗，請稍後再執行。";
                }

                if (addCoordinate.country !== restaurantCountry){
                    return "請確認地址是否為選擇的地區選項";
                }
                const latCoordinate = addCoordinate.lat;
                const lonCoordinate = addCoordinate.lon;

                if (foodNameText !== "" && foodPriceText !== "" && restaurantName !== "" &&
                    restaurantAddress !== "" && restaurantCountry !== "選擇地區" && restaurantCity !== "選擇城市" &&
                    restaurantTypes !== "選擇種類" && restaurantComment !== ""){

                    const formData = new FormData();
                    formData.append("user_id", id);
                    formData.append("rest_name", restaurantName);
                    formData.append("rest_address", restaurantAddress);
                    formData.append("rest_country", restaurantCountry);
                    formData.append("rest_city", restaurantCity);
                    formData.append("rest_lat", latCoordinate);
                    formData.append("rest_lon", lonCoordinate);
                    formData.append("rest_type", restaurantTypes);
                    formData.append("rest_comment", restaurantComment);
                    formData.append("rest_area", restaurantArea);
                    formData.append("rest_foodname", foodNameText);
                    formData.append("rest_foodprice", foodPriceText);
                    formData.append("image", this.imgFiles)

                    console.log(formData);
                    // const response = await fetch("/api/post/single", {
                    //     method: "POST",
                    //     headers: {"Authorization": `Bearer ${token}`},
                    //     body: formData,
                    // });

                    // const dt = await response.json();

                    // if (!response.ok || dt.error !== undefined){
                    //     return "建立貼文失敗，請稍後再執行。";
                    // }

                    return "建立貼文成功。";
                }

                return "建立貼文失敗，請稍後再執行。";
            }catch(error){
                return "建立貼文失敗，請稍後再執行。";
            }
        }
        return "請選擇需要發文的圖片，謝謝您。";
    }

    async getAddressCoordinates(address) {
        const addressCoordinate = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.mapkey}&language=zh-TW`
        try{
            const response = await fetch(addressCoordinate);
            const dt = await response.json();

            if (dt.status === "OK"){
                // 先將資料用到子層的Array位置，再透過foreach迴圈，找對應的資料
                const componentsArr = dt.results[0].address_components;
                const geometryLocation= dt.results[1].geometry.location;
                let country = null;
                let city = null;

                componentsArr.forEach(e => {
                    if (e.types.includes("country")){
                        country = e.long_name;
                    }

                    if (e.types.includes("administrative_area_level_1")){
                        city = e.long_name;
                    }
                });

                return {"data": {
                    "country": country,
                    "city": city,
                    "lat": geometryLocation.lat,
                    "lon": geometryLocation.lng
                }};
            }

            return "error";
        }catch(error){
            return "error";
        }
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
};

const postCommentM = new postCommentModel();
export default postCommentM;