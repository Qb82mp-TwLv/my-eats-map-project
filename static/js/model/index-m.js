class indexModel {
    constructor() {
        this.countryItem = document.querySelector(".country-droplist");
        this.cityItem = document.querySelector(".city-droplist");
        this.typeItem = document.querySelector(".types-droplist");
        this.followItem = document.querySelector(".tracker-droplist");
    
        // 點擊選項，會顯示在此框中
        this.countrySelect = document.querySelector(".country-select");
        this.citySelect = document.querySelector(".city-select");
        this.typesSelect = document.querySelector(".types-select");
    
        // this.cityArr;
        this.mapkey = "";
        // 顯示貼文
        this.viewPosts = document.querySelector(".view-posts");
        this.closePostsDialogBtn = document.querySelector(".close-btn");
        if (this.closePostsDialogBtn){
            this.closePostsDialogBtn.addEventListener("click", () => {
                this.viewPosts.close();
            });
        }

        // 經緯度變數
        this.lat=null;
        this.lon=null;

        // 儲存定位的國家與城市
        this.countryName = "選擇地區";
        this.cityName = [];
        this.typeName = "全部種類";

        this.ownSearchBtn = document.querySelector(".btn-own");
        this.collectSearchBtn = document.querySelector(".btn-collect");

        this.distanceOneBtn = document.querySelector(".btn-dis-onekm");
        this.distanceThreeBtn = document.querySelector(".btn-dis-thrkm");
        this.distanceFiveBtn = document.querySelector(".btn-dis-fivekm");
        // 紀錄要搜尋的距離
        this.searchDisNum = 1;
        // 判斷是否拒絕了定位
        this.rejectPosition = true;

        // 顯示登入、註冊畫面
        this.viewLoginSignin = document.querySelector(".view-login-dialog");
    };

    citySelectText() {
        this.citySelect.textContent = "選擇城市";
    }

    async getCountryOptionName() {
        const response = await fetch("/api/countryname", {
            method: "GET",
            credentials: "include"
        });
        const dt = await response.json();

        await new Promise(delay => setTimeout(delay, 100));
        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
            return null;
        }else{
            return dt;
        };
    }

    async getCityOptionName(country) {
        const response = await fetch(`/api/cityname?country=${country}`, {
            method: "GET",
            credentials: "include"
        });
        const dt = await response.json();

        await new Promise(delay => setTimeout(delay, 100));
        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
            return {"city":[]};
        }else{
            return dt.data;
        } 
    }

    async getTypesOptionName(country, city) {
        const response = await fetch(`/api/typesname?country=${country}&city=${city}`, {
            method: "GET",
            credentials: "include"
        });
        const dt = await response.json();

        await new Promise(delay => setTimeout(delay, 100));
        if (!response.ok || dt.error !== undefined){
            console.log("取得地區資料出現錯誤。");
            return null;
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

    async cityOptionItemClick(optionTag) {
        this.citySelect.textContent = optionTag.textContent;
        const isPositionResult = await this.currentUserPositionOpen();
        this.cityName=[];
        if (isPositionResult === "denied"){
            this.cityName.push(this.citySelect.textContent);
            this.cityName.push("無");
            this.cityName.push("無");
        }
    };

    typesOptionItemClick(optionTag) {
        optionTag.addEventListener("click", () => {
            this.typesSelect.textContent = optionTag.textContent;
            this.typeName = this.typesSelect.textContent;
        });
    }

    async getFollowOptionName(user_id) {
        try{
            const response = await fetch(`/api/user/followmember?user_id=${user_id}`, {
                method: "GET",
                credentials: "include",
            });
            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 100));
            if (!response.ok || dt.error !== undefined){
                return null;
            }

            return dt.data;
        }catch(error){
            return null;
        }
    }

    async getMapValue() { 
        try{
            const response = await fetch("/api/mapvalue", {
                method: "GET",
                credentials: "include"
            });
            const value = await response.json();

            if (!response.ok || value.error!== undefined){
                console.log("地圖發生錯誤。");
            }else{
                this.mapkey = value.data;
            }

            await new Promise(delay => setTimeout(delay, 200));
        }catch{
            console.log("地圖發生錯誤。");
        };

        return this.mapkey;
    }

    async getMapId() {
        let mapid = "";
        try{
            const response = await fetch("/api/mapid", {
                method: "GET",
                credentials: "include"
            });
            const value = await response.json();

            await new Promise(delay => setTimeout(delay, 100));
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
        const addressCoordinate = new google.maps.Geocoder();
        const address_ = String(country)+','+String(city);
        try{
            const response = await addressCoordinate.geocode({address: address_});
            if (response.results && response.results.length){
                const lat = response.results[0].geometry.location.lat();
                const lng = response.results[0].geometry.location.lng();

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

    async closePostsContent() {
        if (this.viewPosts){
            this.viewPosts.close();
        }
    }

    async getDropCoordinates(country, city) {
        const addressCoordinate = new google.maps.Geocoder();
        const address_ = `${city}, ${country}`;
        try{
            const response = await addressCoordinate.geocode({address: address_});
            if (response.results && response.results.length > 0){
                const latlng = response.results[0].geometry.location;
                this.lat = latlng.lat();
                this.lon = latlng.lng();
                return;
            }

            console.log("取得經緯度發生錯誤");
        }catch(error){
            console.log("取得經緯度發生錯誤");
        }
    };

    async currentUserPositionOpen() {
        // 使用promise避免非同步問題
        const response = await navigator.permissions.query({name: "geolocation"});
        return response.state;
    }

    async getHeadshotUrl(imgNM) {
        try{
            const response = await fetch(`/api/user/headshoturl?headshot_name=${imgNM}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                return null;
            }

            return dt.data.img;

        }catch{
            return null;
        }
    };

    // 使用search的button執行搜尋
    async searchPosts(country, city, storeType, keyword) {
        await this.getDropCoordinates(country, city[0]);
        try{
            const paraEncode = new URLSearchParams();
            paraEncode.set("city", city.join(","));

            let urlPara = "";
            // 判斷是否有關鍵字
            if (keyword !== ""){
                urlPara = `?country=${country}&${paraEncode.toString()}&types=${storeType}&lat=${this.lat}&lon=${this.lon}&keyword=${keyword}&km=${this.searchDisNum}`;
            }else{
                urlPara = `?country=${country}&${paraEncode.toString()}&types=${storeType}&lat=${this.lat}&lon=${this.lon}&km=${this.searchDisNum}`;
            }

            const response = await fetch(`/api/search/post${urlPara}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("搜尋發生錯誤");
                return null;
            }

            return dt.data;
        }catch(error){
            return null;
        }
    }

    async searchAgreePositionPosts(lat, lon, storeType, keyword) {
        try{
            let urlPara = "";
            // 判斷是否有關鍵字
            if (keyword !== ""){
                urlPara = `?lat=${lat}&lon=${lon}&types=${storeType}&keyword=${keyword}&km=${this.searchDisNum}`;
            }else{
                urlPara = `?lat=${lat}&lon=${lon}&types=${storeType}&km=${this.searchDisNum}`;
            }

            const response = await fetch(`/api/search/locate/post${urlPara}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("搜尋發生錯誤");
                return null;
            }

            return dt.data;
        }catch(error){
            return null;
        }
    }

    async getStorePosts(user_id , lat, lon) {
        try{
            let urlPara = "";
            switch (user_id){
                case null:
                    urlPara=`?lat=${lat}&lon=${lon}`;
                    break;
                default:
                    urlPara=`?lat=${lat}&lon=${lon}&user_id=${user_id}`;
                    break;
            }

            const response = await fetch(`/api/marker/posts${urlPara}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("搜尋發生錯誤");
                return null;
            }

            return dt.data;
        }catch(error){
            return null;
        }
    }

    async postLikeAndFavoriteBtn(user_id, likeBtn, collectBtn, likeBtnImg, collectBtnImg) {
        if (likeBtn){
            likeBtn.addEventListener("click", () => {
                const result = document.cookie.includes("my_eatweb_isLogged_here=true");
                if (result){
                    // 切換圖片顯示
                    const imgName = likeBtnImg.dataset.like == "yes";
                    const likeCountNum = likeBtn.querySelector(".like-count");
                    let likeCount=0;
                    if (!imgName){
                        likeBtnImg.src = "/static/img/heart-color.png";
                        likeBtnImg.dataset.like="yes";
                        likeCount = parseInt(likeCountNum.textContent) + 1;
                        likeCountNum.textContent = String(likeCount);

                        const postId = parseInt(likeCountNum.dataset.postId);
                        this.likeCountSubmit(user_id, postId, "yes");
                    }else{
                        likeBtnImg.src = "/static/img/heart-nocolor.png";
                        likeBtnImg.dataset.like="no";
                        likeCount = parseInt(likeCountNum.textContent) - 1;
                        likeCountNum.textContent = String(likeCount);

                        const postId = parseInt(likeCountNum.dataset.postId);
                        this.likeCountSubmit(user_id, postId, "no");
                    }
                }else{
                    // 顯示登入畫面
                    this.openLoginAndSigninDialog();
                }
            });
        };

        if (collectBtn){
            collectBtn.addEventListener("click",  () => {
                const result = document.cookie.includes("my_eatweb_isLogged_here=true");
                if (result){
                    // 切換收藏圖片
                    const imgName = collectBtnImg.dataset.collect == "yes";
                    const collectCountNum = collectBtn.querySelector(".collect-count");
                    let collectCount = 0;
                    if (!imgName){
                        collectBtnImg.src = "/static/img/bookmark-color.png";
                        collectBtnImg.dataset.collect="yes";
                        collectCount = parseInt(collectCountNum.textContent) + 1;
                        collectCountNum.textContent = String(collectCount);

                        const postId = parseInt(collectCountNum.dataset.postId);
                        this.collectCountSubmit(user_id, postId, "yes");
                    }else{
                        collectBtnImg.src = "/static/img/bookmark-nocolor.png";
                        collectBtnImg.dataset.collect="no";
                        collectCount = parseInt(collectCountNum.textContent) - 1;
                        collectCountNum.textContent = String(collectCount);

                        const postId = parseInt(collectCountNum.dataset.postId);
                        this.collectCountSubmit(user_id, postId, "no");
                    }
                }else{
                    // 顯示登入畫面
                    this.openLoginAndSigninDialog();
                }
            });
        };
    };

    async likeCountSubmit(user_id, post_id, action) {
        try{
            const formData = new FormData();
            formData.append("user_id", user_id);
            formData.append("post_id", post_id);
            formData.append("action", action);

            // const response = await 
            const response = fetch(`/api/article/likecount`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

        }catch{
            console.log("按讚動作發生錯誤");
        }
    };

    async collectCountSubmit(user_id, post_id, action) {
        try{
            const formData = new FormData();
            formData.append("user_id", user_id);
            formData.append("post_id", post_id);
            formData.append("action", action);

            const response = fetch(`/api/article/collectcount`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

        }catch{
            console.log("收藏動作發生錯誤");
        }
    };

    async ownBtnProcessing(userId) {
        if (this.ownSearchBtn.classList.contains('active')){
            this.ownSearchBtn.classList.remove('active');
            return "取消";
        }else{
            if (this.rejectPosition === true){
                if (this.countryName !== "選擇地區" && this.cityName.length > 0 && this.typeName !== ""){
                    this.ownSearchBtn.classList.toggle('active');
                    this.followItem.classList.remove('active');
                    this.collectSearchBtn.classList.remove('active');

                    // 要執行的搜尋
                    const dtJson = await this.ownSearchPosts(userId, this.lat, this.lon);
                    return dtJson;
                }
                return null;
            }

            this.ownSearchBtn.classList.toggle('active');
            this.followItem.classList.remove('active');
            this.collectSearchBtn.classList.remove('active');

            // 要執行的搜尋
            const dtJson = await this.ownSearchPosts(userId, this.lat, this.lon);
            return dtJson;
        }
       
    };

    async followBtnProcessing() {
        if (this.ownSearchBtn && this.followItem && this.collectSearchBtn){
            this.ownSearchBtn.classList.remove('active');
            this.followItem.classList.toggle('active');
            this.collectSearchBtn.classList.remove('active');
        }
    };

    async followItemHidden() {
        if (this.followItem && this.followItem.classList.contains('active')){
            this.followItem.classList.remove('active');
        }
    }

    async collectBtnProcessing(userId) {
        if (this.collectSearchBtn.classList.contains('active')){
            this.collectSearchBtn.classList.remove('active');
            return "取消";
        }else{
            if (this.rejectPosition === true){
                if (this.countryName !== "選擇地區" && this.cityName.length > 0 && this.typeName !== ""){
                    this.ownSearchBtn.classList.remove('active');
                    this.followItem.classList.remove('active');
                    this.collectSearchBtn.classList.toggle('active');

                    // 要執行的搜尋
                    const dtJson = await this.collectSearchPosts(userId, this.lat, this.lon);
                    return dtJson;
                };
                return null;
            }

            this.ownSearchBtn.classList.remove('active');
            this.followItem.classList.remove('active');
            this.collectSearchBtn.classList.toggle('active');

            // 要執行的搜尋
            const dtJson = await this.collectSearchPosts(userId, this.lat, this.lon);
            return dtJson;
            
        }
    };

    // 使用者自己的貼文資料搜尋
    async ownSearchPosts(userId, lat, lon) {
        try{
            let urlPara = "";
            // 判斷是否有關鍵字
            if (this.rejectPosition === true){
                const paraEncode = new URLSearchParams();
                paraEncode.set("city", this.cityName.join(","));

                urlPara = `?country=${this.countryName}&${paraEncode.toString()}&types=${this.typeName}&lat=${lat}&lon=${lon}&user_id=${userId}&search=own&km=${this.searchDisNum}`;

                const response = await fetch(`/api/search/own/post${urlPara}`,{
                    method: "GET",
                    credentials: "include"
                });

                const dt = await response.json();

                await new Promise(delay => setTimeout(delay, 200));
                if (!response.ok || dt.error !== undefined){
                    console.log("搜尋發生錯誤");
                    return null;
                }

                return dt.data;
            }

            urlPara = `?lat=${lat}&lon=${lon}&types=${this.typeName}&user_id=${userId}&search=own&km=${this.searchDisNum}`;

            const response = await fetch(`/api/search/locate/own/post${urlPara}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("搜尋發生錯誤");
                return null;
            }

            return dt.data;
            
        }catch(error){
            console.log("搜尋發生錯誤");
            return null;
        }
        
    };

    async collectSearchPosts(userId, lat, lon) {
        try{
            const paraEncode = new URLSearchParams();
            paraEncode.set("city", this.cityName.join(","));

            let urlPara = "";
            if (this.rejectPosition === true){
                urlPara = `?country=${this.countryName}&${paraEncode.toString()}&types=${this.typeName}&lat=${lat}&lon=${lon}&user_id=${userId}&search=collect&km=${this.searchDisNum}`;

                const response = await fetch(`/api/search/own/post${urlPara}`,{
                    method: "GET",
                    credentials: "include"
                });

                const dt = await response.json();

                await new Promise(delay => setTimeout(delay, 200));
                if (!response.ok || dt.error !== undefined){
                    console.log("搜尋發生錯誤");
                    return null;
                }

                return dt.data;
            }

            urlPara = `?lat=${lat}&lon=${lon}&types=${this.typeName}&user_id=${userId}&search=collect&km=${this.searchDisNum}`;

            const response = await fetch(`/api/search/locate/own/post${urlPara}`,{
                method: "GET",
                credentials: "include"
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("搜尋發生錯誤");
                return null;
            }

            return dt.data;
            
        }catch(error){
            console.log("搜尋發生錯誤");
            return null;
        }
        
    };

    async setPostFollowBtn(followBtnObj, user_id) {
        const postUserId = followBtnObj.dataset.userId;
        if (followBtnObj.dataset.follow === "no"){
            followBtnObj.textContent = "取消追蹤";
            followBtnObj.dataset.follow = "yes";
            const result = await this.setFollowUser(postUserId, user_id, "yes");
            return result;
        }else if(followBtnObj.dataset.follow === "yes"){
            followBtnObj.textContent = "追蹤";
            followBtnObj.dataset.follow = "no";
            const result = await this.setFollowUser(postUserId, user_id, "no");
            return result;
        }; 
    }

    async setFollowUser(postUserId, user_id, action) {
        try{
            const formData = new FormData();
            formData.append("post_user_id", postUserId);
            formData.append("user_id", user_id);
            formData.append("action", action);

            const response = await fetch(`/api/article/follow`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

            const data = await response.json();

            if(!response.ok || data.error !== undefined){
                return false;
            }

            return true;
        }catch{
            console.log("追蹤動作發生錯誤");
            return false;
        }
    }

    async changeImg() {
        const fileUpload = document.getElementById("image-upload");
        fileUpload.addEventListener("change", (e) => {
            this.imgFile = e.target.files[0];

            this.previewImg.src = URL.createObjectURL(this.imgFile);
        });
    };

    async slideBtnClick() {
        const contentImgCTN = document.querySelectorAll(".content-img-container");
        contentImgCTN.forEach((item) => {
            const slideLeftBtn = item.querySelector("#slideLeft");

            slideLeftBtn.addEventListener("click", function() {
                // 預覽圖片容器
                const foodImgCTN = item.querySelector(".food-img-info");

                // 當下取得位置
                const posImg = foodImgCTN.scrollLeft;
                const imgCTNAllWidth = foodImgCTN.offsetWidth;
                
                foodImgCTN.scrollTo({
                    // 需要使用當下位置扣掉總圖片容器寬度
                    left: posImg - imgCTNAllWidth,
                    behavior: "smooth",
                });
            });

            const slideRightBtn = item.querySelector("#slideRight");
            slideRightBtn.addEventListener("click", function() {
                // // 預覽圖片容器
                const foodImgCTN = item.querySelector(".food-img-info");
                foodImgCTN.scrollBy({
                    left: foodImgCTN.offsetWidth,
                    behavior: "smooth"
                });
            });
            
        })
    }

    // 切換按鈕的顏色
    disOneClick() {
        if (!this.distanceOneBtn.classList.contains('active')){
            this.distanceOneBtn.classList.toggle('active');
        }
    }


    disThreeClick() {
        if (!this.distanceThreeBtn.classList.contains('active')){
            this.distanceThreeBtn.classList.toggle("active");
        }
    }

    disFiveClick() {
        if (!this.distanceFiveBtn.classList.contains('active')){
            this.distanceFiveBtn.classList.toggle('active');
        }
    }

    distanceBtnHidden() {
        switch (this.searchDisNum) {
            case 1:
                this.distanceThreeBtn.classList.remove('active');
                this.distanceFiveBtn.classList.remove('active');
                break;
            case 5:
                this.distanceOneBtn.classList.remove('active');
                this.distanceFiveBtn.classList.remove('active');
                break;
            case 10:
                this.distanceThreeBtn.classList.remove('active');
                this.distanceOneBtn.classList.remove('active');
                break;
        }
    }

    async openLoginAndSigninDialog() {
        if (this.viewLoginSignin){
            this.viewLoginSignin.showModal();
        }
    }

    async closeLoginAndSigninDialog() {
        if (this.viewLoginSignin){
            this.viewLoginSignin.close();
        }
    }

    async anotherSearchBtnHidden() {
        this.ownSearchBtn.classList.remove('active');
        this.collectSearchBtn.classList.remove('active');
    };

    async movingMapOwnBtnProcessing(userId, lat, lon) {
        if (this.rejectPosition === true){
            if (this.countryName !== "選擇地區" && this.cityName.length > 0 && this.typeName !== ""){
                // 要執行的搜尋
                const dtJson = await this.ownSearchPosts(userId, lat, lon);
                return dtJson;
            }
            return null;
        }

        // 要執行的搜尋
        const dtJson = await this.ownSearchPosts(userId, lat, lon);
        return dtJson;
    };

    async movingMapCollectBtnProcessing(userId, lat, lon) {
        if (this.rejectPosition === true){
            if (this.countryName !== "選擇地區" && this.cityName.length > 0 && this.typeName !== ""){
                // 要執行的搜尋
                const dtJson = await this.collectSearchPosts(userId, lat, lon);
                return dtJson;
            };
            return null;
        }

        // 要執行的搜尋
        const dtJson = await this.collectSearchPosts(userId, lat, lon);
        return dtJson;
    };
}

const indexM = new indexModel();
export default indexM;