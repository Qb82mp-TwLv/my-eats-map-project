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

        // 取得其他物件
        this.searchAddress = document.querySelector(".search-address");
        this.storeDatail = document.querySelector(".name-address-text");
        this.restNameText = null;
        this.addressText = null;
        // this.restNameText = document.querySelector(".rest-name-text");
        // this.addressText = document.querySelector(".address-text");
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

        this.explainStrToast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
        });
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
                    window.location.replace("/");
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
        // 先取得圖片
        if (this.imgFiles !== null){
            try{
                const imgFilesLength = this.imgFiles.length;

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
                const restaurantName = this.restNameText;
                const restaurantAddress = this.addressText;
                const restaurantCountry = this.countrySelect.textContent;
                const restaurantCity = this.citySelect.textContent;
                const restaurantTypes = this.typesSelect.textContent;
                const restaurantComment = this.commentInfoText.value;
                const restaurantArea = this.diningAreaInfoText.value;
        

                if (foodNameText !== "" && foodPriceText !== "" && restaurantName !== "" &&
                    restaurantAddress !== "" && restaurantCountry !== "選擇地區" && restaurantCity !== "選擇城市" &&
                    restaurantTypes !== "全部種類" && restaurantComment !== ""){

                    const formData = new FormData();
                    formData.append("user_id", id);
                    formData.append("rest_name", restaurantName);
                    formData.append("rest_address", restaurantAddress);
                    formData.append("rest_country", restaurantCountry);
                    formData.append("rest_city", restaurantCity);
                    formData.append("rest_lat", this.latCoordinate);
                    formData.append("rest_lon", this.lonCoordinate);
                    formData.append("rest_type", restaurantTypes);
                    formData.append("rest_comment", restaurantComment);
                    formData.append("rest_area", restaurantArea);
                    formData.append("rest_foodname", foodNameText);
                    formData.append("rest_foodprice", foodPriceText);
                    for(let i=0; i<imgFilesLength; i++){
                        formData.append("image", this.imgFiles[i]);
                    };
                    
                    const response = await fetch("/api/article", {
                        method: "POST",
                        credentials: "include",
                        body: formData,
                    });

                    const dt = await response.json();

                    if (!response.ok || dt.error !== undefined){
                        console.error("後端報錯詳情:", dt);
                        return "建立貼文失敗，請稍後再執行。";
                    }

                    return dt;
                }

                return "建立貼文失敗，請確認所有的欄位都有選擇或輸入。";
            }catch(error){
                return "建立貼文失敗，請稍後再執行。";
            }
        }
        return "請選擇需要發文的圖片，謝謝您。";
    }

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
                // 需要使用當下位置扣掉容器寬度
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
                this.explainStrToast.fire({
                    icon: "info",
                    title: "請從建議列表欄中，選取要使用的地點。",
                });
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
                this.explainStrToast.fire({
                    icon: "info",
                    title: "請選擇餐飲相關的店家，謝謝。",
                });
                return;
            }
        });
    }
};

const postCommentM = new postCommentModel();
export default postCommentM;