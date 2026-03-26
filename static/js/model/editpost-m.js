class editPostModel {
    constructor() {
        // 點擊選項，會顯示在此框中
        this.countrySelect = document.querySelector(".country-select");
        this.citySelect = document.querySelector(".city-select");
        this.typesSelect = document.querySelector(".type-select");

        this.countryItem = document.querySelector(".country-droplist");
        this.cityItem = document.querySelector(".city-droplist");
        this.typeItem = document.querySelector(".type-droplist");

        // // 取得選取的圖片
        // this.imgFiles=null;

        // 取得其他物件
        this.searchAddress = document.querySelector(".search-address");
        this.storeDatail = document.querySelector(".name-address-text");
        this.restNameText = null;
        this.addressText = null;
        this.commentInfoText = document.querySelector(".comment-info");
        this.diningAreaInfoText = document.querySelector(".dining-area-info");
        // 貼文的餐廳經緯度
        this.latCoordinate = null;
        this.lonCoordinate = null;
    
        this.getMapValue();

        // 滑動圖片的按鈕
        this.slideLeftBtn = document.getElementById("slideLeft");
        this.slideRightBtn = document.getElementById("slideRight");
        
        // loading
        this.loaderUI = document.querySelector(".loading-container");

        // 貼文是否要刪除的詢問視窗
        this.viewAskContent = document.querySelector(".delete-ask-window");
    }

    async memberCenter() {
        this.loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/member");
                }, 300);
                
            });
        });
    }

    async homePage() {
        this.loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/eatsmap");
                }, 300);
                
            });
        });
    }

    async getCityOptionName(country) {
        const response = await fetch(`/api/cityname?country=${country}`, {
            method: "GET",
            credentials: "include",
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
            credentials: "include",
        });
        const dt = await response.json();

        await new Promise(delay => setTimeout(delay, 100));
        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
        }else{
            return dt;
        } 
    };

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

    async getMapValue() { 
        try{
            const response = await fetch("/api/mapvalue", {
                method: "GET",
                credentials: "include",
            });
            const value = await response.json();

            if (!response.ok || value.error!== undefined){
                console.log("地圖發生錯誤。");
            }else{
                const mapkey = value.data;

                const mapScript = document.createElement("script");
                mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapkey}&libraries=places`;
                mapScript.async = true;
                mapScript.defer = true;

                mapScript.onload= () => {
                    this.autoSearchAddress();
                };
                
                document.body.appendChild(mapScript);
                
            }
        }catch(error){
            console.log("地圖發生錯誤。");
        };
    }

    async slideBtnClick() {
        this.slideLeftBtn.addEventListener("click", () => {
            // 預覽圖片容器
            const previewImgCTN = document.querySelector(".preview-img-slide");
            
            // 當下取得位置
            const posImg = previewImgCTN.scrollLeft;
            const imgCTNAllWidth = previewImgCTN.offsetWidth;
            
            previewImgCTN.scrollTo({
                left: posImg - imgCTNAllWidth,
                behavior: "smooth"
            });
        });

        this.slideRightBtn.addEventListener("click", () => {
            // 預覽圖片容器
            const previewImgCTN = document.querySelector(".preview-img-slide");
            previewImgCTN.scrollBy({
                left: previewImgCTN.offsetWidth,
                behavior: "smooth"
            });
        });
    }

    async autoSearchAddress() {
        const placesComplete = new google.maps.places.Autocomplete(
            this.searchAddress, {
                fields:["name", "formatted_address", "geometry", "types"],
                typws: ["establishment"]
            }
        );

        placesComplete.addListener("place_changed", () => {
            const selectPlace = placesComplete.getPlace();

            if (!selectPlace.geometry || !selectPlace.name){
                console.log("搜尋地點過程中，找不到輸入地點的相關資訊");
                alert("請從建議列表欄中，選取要使用的地點。");
                return;
            }

            if (selectPlace.types.includes("restaurant") || selectPlace.types.includes("cafe") 
                || selectPlace.types.includes("bar") || selectPlace.types.includes("bakery")
                || selectPlace.types.includes("meal_takeaway") || selectPlace.types.includes("meal_delivery")
                || selectPlace.types.includes("food")){

                this.storeDatail.textContent = `店家資訊：${selectPlace.name}；${selectPlace.formatted_address}`;
                this.restNameText = String(`${selectPlace.name}`);
                this.addressText = String(`${selectPlace.formatted_address}`);

                this.latCoordinate = parseFloat(selectPlace.geometry.location.lat());
                this.lonCoordinate = parseFloat(selectPlace.geometry.location.lng());
                
                this.searchAddress.value = String(`${selectPlace.name}`);
            }else{
                alert("請選擇餐飲相關的店家，謝謝。");
                return;
            }
        });
    }

    async editPostInfo(posId, userId) {
        try{
            const response = await fetch(`/api/post/edit?post_id=${posId}&&user_id=${userId}`, {
                method: "GET",
                credentials:"include",
            });

            const data = await response.json();
            if (!response.ok || data.error !== undefined){
                return null;
            }

            return data;

        }catch{
            return null;
        }
    }

    closeAskDialog() {
        this.viewAskContent.close();
    }

    openAskDialog(){
        if (this.viewAskContent){
            this.viewAskContent.showModal();
        }
    }

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

    joinImgArrIntoString(dt) {
        let textImgName = "";
        for (let i=0; i < dt.length; i++){
            if (i === 0){
                textImgName += String(dt[i]);
                continue;
            }
            textImgName += "," +String(dt[i]);
        }
        return textImgName;
    }

    async saveEditPostInfo(postId, id, saveImgArr, delImgArr) {  
        try{
            let foodNameText = "";
            let foodPriceText = "";

            // 取得form物件
            const formObj = document.querySelectorAll(".food-block");
            formObj.forEach((form, idx) => {
                const formArr = new FormData(form);
                // 取得input name的方式，撈取所有的值
                const foodNameArr = formArr.getAll("nametext");
                const foodPriceArr = formArr.getAll("pricetext");
                const nameText = this.joinText(foodNameArr);
                const priceText = this.joinText(foodPriceArr);
                if (idx !== 0){
                    foodNameText += "," + nameText;
                    foodPriceText += "," + priceText;
                }else{
                    foodNameText = nameText;
                    foodPriceText = priceText;
                }
            })

            // 取得其他值
            const storeNameAddressStr = document.querySelector(".name-address-text").textContent;
            const storeNameAddressStrReplace = storeNameAddressStr.replace("店家資訊：", "");
            const storeNameAddressStrSplit = storeNameAddressStrReplace.split("；");
            const restaurantName = storeNameAddressStrSplit[0];
            const restaurantAddress = storeNameAddressStrSplit[1];
            
            const restaurantCountry = this.countrySelect.textContent;
            const restaurantCity = this.citySelect.textContent;
            const restaurantTypes = this.typesSelect.textContent;
            const restaurantComment = this.commentInfoText.value;
            const restaurantArea = this.diningAreaInfoText.value;
            const imgStr = this.joinImgArrIntoString(saveImgArr);

            if (foodNameText !== "" && foodPriceText !== "" && restaurantName !== "" &&
                restaurantAddress !== "" && restaurantCountry !== "選擇地區" && restaurantCity !== "選擇城市" &&
                restaurantTypes !== "全部種類" && restaurantComment !== ""){

                const formData = new FormData();
                formData.append("post_id", postId);
                formData.append("user_id", id);
                formData.append("rest_name", restaurantName);
                formData.append("rest_address", restaurantAddress);
                formData.append("rest_country", restaurantCountry);
                formData.append("rest_city", restaurantCity);
                // 後端要判斷是否有改餐廳位置
                if (this.latCoordinate!== null && this.lonCoordinate!== null){
                    formData.append("rest_lat", this.latCoordinate);
                    formData.append("rest_lon", this.lonCoordinate);
                };
                formData.append("rest_type", restaurantTypes);
                formData.append("rest_comment", restaurantComment);
                formData.append("rest_area", restaurantArea);
                formData.append("rest_foodname", foodNameText);
                formData.append("rest_foodprice", foodPriceText);
                formData.append("image", imgStr);
                for(let i=0; i<delImgArr.length; i++){
                    formData.append("del_image[]", delImgArr[i]);
                }

                const response = await fetch("/api/post/edit", {
                    method: "PUT",
                    credentials: "include",
                    body: formData,
                });

                const dt = await response.json();

                if (!response.ok || dt.error !== undefined){
                    console.error("後端報錯詳情:", dt);
                    return false;
                }

                return true;
            }

            return false;
        }catch(error){
            return false;
        }
    };
};

const editPostM = new editPostModel();
export default editPostM;