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

        // 滑動圖片的按鈕
        this.slideLeftBtn = document.getElementById("slideLeft");
        this.slideRightBtn = document.getElementById("slideRight");
        // 預覽圖片容器
        this.previewImgCTN = document.querySelector(".preview-img-slide");
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
        let textAdd = "";
        for (let i=0; i < arr.length; i++){
            if (i === 0){
                textAdd += String(arr[i]);
                continue;
            }
            textAdd += "," +String(arr[i]);
        }

        return textAdd;
    }

    async submitPostInfo(id) {
        const token = localStorage.getItem("token");
        console.log(id);
        console.log(`資料型別: ${typeof id}`);
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
                    console.log("找經緯度")
                    return "建立貼文失敗，請稍後再執行。";
                }

                if (addCoordinate.data.country !== restaurantCountry){
                    return "請確認地址是否為選擇的地區選項，或是選項中並沒有該地區，\n請根據有的地區進行發文動作，謝謝。";
                };
                if (!addCoordinate.data.city.includes(restaurantCity)){
                    return "請確認地址是否為選擇的城市選項，或是選項中並沒有該城市，\n請根據有的城市進行發文動作，謝謝。";
                }

                const latCoordinate = parseFloat(addCoordinate.data.lat);
                const lonCoordinate = parseFloat(addCoordinate.data.lon);

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
                    for(let i=0; i<imgFilesLength; i++){
                        formData.append("image", this.imgFiles[i]);
                    };
                    
                    // formData.forEach((value, key) => {
                    //     console.log(`欄位名稱: ${key}`);
                    //     console.log(`數值內容: "${value}"`); // 加上引號方便觀察有無空白
                    //     console.log(`資料型別: ${typeof value}`);
                    //     console.log('---');
                    // });
                    const response = await fetch("/api/post/single", {
                        method: "POST",
                        headers: {"Authorization": `Bearer ${token}`},
                        body: formData,
                    });

                    const dt = await response.json();

                    if (!response.ok || dt.error !== undefined){
                        console.error("後端報錯詳情:", dt);
                        return "建立貼文失敗，請稍後再執行。";
                    }
                    console.error(dt);
                    return "建立貼文成功。";
                }

                return "建立貼文失敗，請稍後再執行。";
            }catch(error){
                console.log(error);
                return "建立貼文失敗，請稍後再執行。";
            }
        }
        return "請選擇需要發文的圖片，謝謝您。";
    }

    async getAddressCoordinates(address) {
        console.log(address);
        const addressCoordinate = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.mapkey}&language=zh-TW`
        try{
            const response = await fetch(addressCoordinate);
            const dt = await response.json();

            if (dt.status === "OK"){
                // 先將資料用到子層的Array位置，再透過foreach迴圈，找對應的資料
                const componentsArr = dt.results[0].address_components;
                const geometryLocation= dt.results[0].geometry.location;
                let country = null;
                let city = [];

                componentsArr.forEach(e => {
                    if (e.types.includes("country")){
                        country = e.long_name;
                    };

                    if (e.types.includes("locality")){
                        city.push(e.long_name);
                    };

                    if (e.types.includes("administrative_area_level_2")){
                        city.push(e.long_name);
                    };

                    if (e.types.includes("administrative_area_level_1")){
                        city.push(e.long_name);
                    };
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

    async slideBtnClick() {
        this.slideLeftBtn.addEventListener("click", () => {
            this.previewImgCTN.scrollTo({
                left: -this.previewImgCTN.offsetWidth,
                behavior: "smooth"
            });
        });

        this.slideRightBtn.addEventListener("click", () => {
            this.previewImgCTN.scrollTo({
                left: this.previewImgCTN.offsetWidth,
                behavior: "smooth"
            });
        });
    }
};

const postCommentM = new postCommentModel();
export default postCommentM;