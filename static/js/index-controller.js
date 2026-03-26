import indexM  from './model/index-m.js';
import indexV  from './view/index-v.js';


const explainToast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2500,
});

let markerArr = [];
let userId = null;
const loaderUI = document.querySelector(".loading-container");
async function verify_user_token() {
    try{    
        const response = await fetch("/api/user/auth", {
            method: "GET",
            credentials: "include",
        });

        const dt = await response.json();

        if (dt.data === null){
            visitorProcess();
            followPostSearch("none")
            return;
        }

        // 顯示登入會員之後的按鈕控制
        viewMemberFunc();

        await new Promise(delay => setTimeout(delay, 200));
        setMemberInfo(dt.data.headshot, dt.data.name, dt.data.nickname);       
        userId=dt.data.id;
        followPostSearch(dt.data.id);
        headshotFunc();
        addPostFunc();
    }catch(error){
        console.log("驗證會員失敗");
        visitorProcess();
        followPostSearch("none")
    }
};

// 訪客可以使用的一些功能
async function visitorProcess() {
    // 設定大頭照片
    indexV.setHeadshotImg(null);
    indexV.settingName("訪客");

    // 隱藏發文按鈕
    const addPostBtn = document.querySelector(".create-posts-btn");
    addPostBtn.style.display = "none";
}

async function viewMemberFunc() {
    // 隱藏發文按鈕
    const addPostBtn = document.querySelector(".create-posts-btn");
    addPostBtn.style.display = "grid";
    // 顯示登入按鈕
    const logginBtn = document.querySelector(".loggin-btn-container");
    logginBtn.style.display="none"
}

async function loadingMap() {
    const mapkey = await indexM.getMapValue();

    const mapScript = document.createElement("script");
    mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapkey}&loading=async&callback=initMap&libraries=marker&language=zh-TW`;
    mapScript.async = true;
    mapScript.defer = true;
    document.body.appendChild(mapScript);
}

let map;

async function initMap() {
    const mapid = await indexM.getMapId();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { 
            lat: 25.03420, 
            lng: 121.56452, 
        },
        mapId: `${mapid}`,
        zoom: 12,
        tilt:0,
        heading: 0,
        rotateControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: false, // 停用預設的點擊事件
    });

}


async function createOptionItem() {
    // 取得地區(國家)
    const dt = await indexM.getCountryOptionName();
    if (dt !== null){
        // 建立地區的droplist
        const countryArr = dt.data;
        const country = countryArr.country;
        const countrySelect = document.querySelector(".country-select");
        sessionStorage.setItem("country", country);
        for(let i=0; i< country.length; i++){
            const optionTag = indexV.countryDropList(country[i]);
            optionTag.addEventListener("click", async () => {
                countrySelect.textContent = country[i];
                const isPositionResult = await indexM.currentUserPositionOpen();
                // 先確認是否已經關閉定位了
                if (isPositionResult === "denied" || indexM.rejectPosition === true){
                    indexM.countryName = countrySelect.textContent;
                }
                createCityOptionItem(country[i]);
            });
        };
    }
}

async function createCityOptionItem(country) {
    const cityOption = document.querySelector(".city-option");
    const childNode = cityOption.querySelectorAll("li");
    if (childNode){
        childNode.forEach(child => {
            child.remove();
        });
    }
    
    const cityArr = await indexM.getCityOptionName(country);
    const city = cityArr.city;
    for(let i=0; i< city.length; i++){
        const optionTag = indexV.cityDropList(city[i]);
        optionTag.addEventListener("click", async () => {
            await indexM.cityOptionItemClick(optionTag);
            createTypesOptionItem(country, city[i]);
        });
    };  
    indexM.citySelectText();
}

async function createTypesOptionItem(country, city) {
    indexM.typesSelect.textContent = "全部種類";
    const cityOption = document.querySelector(".types-option");
    const childNode = cityOption.querySelectorAll("li");
    if (childNode){
        childNode.forEach(child => {
            child.remove();
        });
    }

    const typesDt = await indexM.getTypesOptionName(country, city);
    if (typesDt !== null){
        const typesArr = typesDt.data;
        const types = typesArr.types;
        for(let i=0; i< types.length; i++){
            const optionTag = indexV.typesDropList(types[i]);
            indexM.typesOptionItemClick(optionTag);
        };
    }else{
        const types = ["全部種類"];
        for(let i=0; i< types.length; i++){
            const optionTag = indexV.typesDropList(types[i]);
            indexM.typesOptionItemClick(optionTag);
        };
    }
    
}

async function searchBarOptionClick() {
    const countryDroplist = document.querySelector(".country-select");
    countryDroplist.addEventListener("click", () => {
        indexM.countryOptionClick();
    });

    const cityDroplist = document.querySelector(".city-select");
    cityDroplist.addEventListener("click", () => {
        indexM.cityOptionClick();
    });

    const typeDroplist = document.querySelector(".types-select");
    typeDroplist.addEventListener("click", () => {
        indexM.typeOptionClick();
    });

    document.addEventListener("click", (e) => {
        // 若都不是點擊在這些下拉式物件時，才會將所有的下拉式關閉
        if (!countryDroplist.contains(e.target) && !cityDroplist.contains(e.target) && !typeDroplist.contains(e.target)){
            indexM.droplistOptionHidden();
        }
    })
};

async function createFollowUser(user_id) {
    const result = document.cookie.includes("my_eatweb_isLogged_here=true");
    if (result){
        indexV.clearFollowOptions();

        const followDt = await indexM.getFollowOptionName(user_id);
        const btnTracker = document.querySelector(".btn-tracker");
        if (followDt !== null){
            for(let i=0; i< followDt.length; i++){
                const optionTag = indexV.followDropList(followDt[i][String(i)][0], followDt[i][String(i)][1]);
                optionTag.addEventListener("click", async () => {
                    btnTracker.textContent = optionTag.textContent;
                    const follow_id = optionTag.dataset.followId;
                    const dtJson = await indexM.ownSearchPosts(follow_id);
                    genMarker(dtJson);
                });

            };
        }
    }
}

const searchBtn = document.querySelector(".input-item-btn");
if (searchBtn){
    searchBtn.addEventListener("click", () => {
        searchPosts();
    });
}

async function searchPosts() {
    // 取得選項
    const storeType = indexM.typesSelect.textContent;
    if (indexM.rejectPosition === true){
        const country = indexM.countryName;
        const city = indexM.cityName;

        if (city.length !== 0){
            if (country!=="選擇地區" && city[0]!=="選擇城市" && storeType!==""){
                const keywordStr = document.querySelector(".input-item-keyword").value.trim();
                const dtJson = await indexM.searchPosts(indexM.countryName, indexM.cityName, storeType, keywordStr);
                if (dtJson !== null){
                    clearMarker();

                    for(let i=0; i<dtJson.length; i++){
                        const markerObj = await indexV.marker(map, { lat: dtJson[i].lat, lng: dtJson[i].lon,}, dtJson[i].img);
                        markerObj.postId = dtJson[i].post_id;
                        markerObj.addEventListener("click", async () => {
                            const result = await indexM.getStorePosts(userId, markerObj.position.lat, markerObj.position.lng);
                            if (result !== null){
                                indexM.openPostsContent();
                                await modifyPostInfoInDialog(result);
                                indexM.slideBtnClick();
                            }
                        });

                        markerArr.push(markerObj);
                    }
                }
                
                // 找出當下位置
                const {lat, lng} = await indexM.searchPosition(country, city[0]);

                if (lat !== "nan" && lng !== "nan"){
                    indexM.lat = lat;
                    indexM.lon = lng;
                    const newPosition = {
                        lat: lat, 
                        lng: lng
                    }
                    map.panTo(newPosition);
                }

                // 若沒找到資料要發出沒找到的資訊
                if (dtJson!== null && dtJson.length === 0){
                    explainToast.fire({
                        icon: "info",
                        title: "抱歉，沒搜尋到相關的貼文。",
                    });
                }

                if (dtJson === null){
                    explainToast.fire({
                        icon: "error",
                        title: "抱歉，搜尋相關貼文失敗。",
                    });
                }
            };
        };
    }else if(indexM.rejectPosition === false){
        // 先定位
        const newPosition = {
            lat: indexM.lat, 
            lng: indexM.lon
        }
        map.panTo(newPosition);

        const keywordStr = document.querySelector(".input-item-keyword").value.trim();
        const dtJson = await indexM.searchAgreePositionPosts(storeType, keywordStr);
        if (dtJson !== null){
            clearMarker();

            for(let i=0; i<dtJson.length; i++){
                const markerObj = await indexV.marker(map, { lat: dtJson[i].lat, lng: dtJson[i].lon,}, dtJson[i].img);
                markerObj.postId = dtJson[i].post_id;
                markerObj.addEventListener("click", async () => {
                    const result = await indexM.getStorePosts(userId, markerObj.position.lat, markerObj.position.lng);
                    if (result !== null){
                        indexM.openPostsContent();
                        await modifyPostInfoInDialog(result);
                        indexM.slideBtnClick();
                    }
                });

                markerArr.push(markerObj);
            }
        }

        // 若沒找到資料要發出沒找到的資訊
        if (dtJson!== null && dtJson.length === 0){
            explainToast.fire({
                icon: "info",
                title: "抱歉，沒搜尋到相關的貼文。",
            });
        }

        if (dtJson === null){
            explainToast.fire({
                icon: "error",
                title: "抱歉，搜尋相關貼文失敗。",
            });
        }
            
    }
    
};

async function clearMarker() {
    for (let i=0; i<markerArr.length; i++){
        // 將每個marker從地圖上移除
        markerArr[i].map =null;
        markerArr[i]=undefined;
    }
    markerArr=[];
};

function postHeadshotClcik(headshotImgTag) {
    headshotImgTag.addEventListener("click", async function() {
        const result = document.cookie.includes("my_eatweb_isLogged_here=true");
        if (result){
            if (parseInt(headshotImgTag.dataset.userNum) === userId){
                // 需要登入才可以使用
                indexM.closePostsContent();
                memberCenter();
            }else{
                indexM.closePostsContent();
                otherMemberCenter(headshotImgTag.dataset.userNum);
            }
        }else{
            // 跳出登入的畫面
            indexM.openLoginAndSigninDialog();
        }
    });
}

async function modifyPostInfoInDialog(dt) {
    // 顯示許多貼文的容器
    const postsCTNTag = document.querySelector(".posts-container");
    // 清除之前的內容
    postsCTNTag.textContent ="";

    // 建立圖片的內容
    for (let i=0; i<dt.length; i++){
        // 建立外殼
        const postContentCTNTag = document.createElement("div");
        postContentCTNTag.classList.add("post-content-container");
        const postContentImgTag = document.createElement("div");
        postContentImgTag.classList.add("post-content-img");
        const contentImgCTNTag = document.createElement("div");
        contentImgCTNTag.classList.add("content-img-container");
        // 圖片層區塊
        // 食物圖片與文字
        const foodImgInfoTag = document.createElement("div");
        foodImgInfoTag.classList.add("food-img-info");
        for (let k=0; k<dt[i].post.img.length; k++){
            // 滑軌區塊
            const imgInfoScrollTag = document.createElement("div");
            imgInfoScrollTag.classList.add("img-info-scroll");
            // 圖片
            const imgSlidesTag = document.createElement("div");
            imgSlidesTag.classList.add("imgSlides");
            imgSlidesTag.id = "imgItem";
            const imgContainerTag = document.createElement("div");
            imgContainerTag.classList.add("img-container");
            const imgTag = document.createElement("img");
            imgTag.src=dt[i].post.img[k];
            imgContainerTag.appendChild(imgTag);
            imgSlidesTag.appendChild(imgContainerTag);

            const foodInfoTag = document.createElement("div");
            foodInfoTag.classList.add("food-info");
            const infoContainerTag = document.createElement("div");
            infoContainerTag.classList.add("food-info-container");
            const imgNameTag = document.createElement("div");
            imgNameTag.classList.add("img-name");
            imgNameTag.textContent = String(dt[i].post.foodname[k]);
            const imgPriceTag = document.createElement("div");
            imgPriceTag.classList.add("img-price");
            imgPriceTag.textContent = String(dt[i].post.price[k])+"元";
            infoContainerTag.appendChild(imgNameTag);
            infoContainerTag.appendChild(imgPriceTag);
            foodInfoTag.appendChild(infoContainerTag);

            imgInfoScrollTag.appendChild(imgSlidesTag);
            imgInfoScrollTag.appendChild(foodInfoTag); 

            foodImgInfoTag.append(imgInfoScrollTag);
        }

        // 移動滑軌的按鈕
        const slideBtnTag = document.createElement("div");
        slideBtnTag.classList.add("sildeBtn");
        slideBtnTag.style.display="none";
        const leftBtnTag = document.createElement("button");
        leftBtnTag.type = "button";
        leftBtnTag.classList.add("leftBtn");
        leftBtnTag.id="slideLeft";   
       
        const leftBtnImgTag = document.createElement("img");
        leftBtnImgTag.src="/static/img/left-button.png";
        leftBtnTag.appendChild(leftBtnImgTag);
        
        const rightBtnTag = document.createElement("button");
        rightBtnTag.type = "button";
        rightBtnTag.classList.add("rightBtn");
        rightBtnTag.id= "slideRight";
        
        const rightBtnImgTag = document.createElement("img");
        rightBtnImgTag.src="/static/img/right-button.png";
        rightBtnTag.appendChild(rightBtnImgTag);
        slideBtnTag.appendChild(leftBtnTag);
        slideBtnTag.appendChild(rightBtnTag);

        contentImgCTNTag.appendChild(foodImgInfoTag);
        contentImgCTNTag.appendChild(slideBtnTag);

        // 按讚與留言
        const postEvaluateActTag = document.createElement("div");
        postEvaluateActTag.classList.add("post-evaluate-action");
        // 按讚功能
        const loveBtnTag = document.createElement("div");
        loveBtnTag.classList.add("love-btn");
        loveBtnTag.dataset.postId = String(dt[i].post.post_id);
        const loveBtnImgTag = document.createElement("img");
        if (String(dt[i].post.lk_click) === "no"){
            loveBtnImgTag.src = "/static/img/heart-nocolor.png";
            loveBtnImgTag.dataset.like="no";
        }else{
            loveBtnImgTag.src = "/static/img/heart-color.png";
            loveBtnImgTag.dataset.like="yes";
        }
        loveBtnImgTag.id="like-btn";
        const likeCountTag = document.createElement("div");
        likeCountTag.classList.add("like-count");
        likeCountTag.dataset.postId=String(dt[i].post.post_id);
        likeCountTag.textContent = String(dt[i].post.lk_total);
        loveBtnTag.appendChild(loveBtnImgTag);
        loveBtnTag.appendChild(likeCountTag);
        // 收藏
        const collectBtnTag = document.createElement("div");
        collectBtnTag.classList.add("collect-btn");
        collectBtnTag.dataset.postId = String(dt[i].post.post_id);
        const collectBtnImgTag = document.createElement("img");
        if (String(dt[i].post.co_click) === "no"){
            collectBtnImgTag.src = "/static/img/bookmark-nocolor.png";
            collectBtnImgTag.dataset.collect="no";
        }else{
            collectBtnImgTag.src = "/static/img/bookmark-color.png";
            collectBtnImgTag.dataset.collect="yes";
        }
        collectBtnImgTag.id="favorite-btn";
        const collectCountTag = document.createElement("div");
        collectCountTag.classList.add("collect-count");
        collectCountTag.dataset.postId=String(dt[i].post.post_id);
        collectCountTag.textContent = String(dt[i].post.co_total);
        collectBtnTag.appendChild(collectBtnImgTag);
        collectBtnTag.appendChild(collectCountTag);
        postEvaluateActTag.appendChild(loveBtnTag);
        postEvaluateActTag.appendChild(collectBtnTag);

        postContentImgTag.appendChild(contentImgCTNTag);
        postContentImgTag.appendChild(postEvaluateActTag);
        // 上層結束

        // 顯示發文者與貼文文字內容
        const postContentCommTag = document.createElement("div");
        postContentCommTag.classList.add("post-content-comment");

        const userInfoTag = document.createElement("div");
        userInfoTag.classList.add("user-info");
        const userHeadshotTag = document.createElement("div");
        userHeadshotTag.classList.add("user-headshot");
        const headshotImgTag = document.createElement("img");
        if (dt[i].user.headshot === null){
            headshotImgTag.src = "/static/img/user.png";
        }else{
            headshotImgTag.src = String(dt[i].user.headshot);
        };
        headshotImgTag.classList.add("post-user-headshot");
        headshotImgTag.dataset.userNum = String(dt[i].user.user_id);
        postHeadshotClcik(headshotImgTag);
        userHeadshotTag.appendChild(headshotImgTag);

        const userNicknameCTN = document.createElement("div");
        userNicknameCTN.classList.add("usernickname-CTN");
        const userNickname = document.createElement("div");
        userNickname.classList.add("user-nickname");
        if (String(dt[i].user.nickname) !== null){
            userNickname.textContent = String(dt[i].user.nickname);
        }else{
            userNickname.textContent = String(dt[i].user.name);
        };
        
        const followBtn = document.createElement("button");
        followBtn.type="button";
        if (dt[i].user.user_id !== userId){
            followBtn.classList.add("follow-btn");
            followBtn.dataset.userId=String(dt[i].user.user_id);
            followBtn.dataset.follow=String(dt[i].post.follow);
            if (String(dt[i].post.follow) === "no"){
                followBtn.textContent="追蹤";
            }else{
                followBtn.textContent="取消追蹤";
            }
            
            userNicknameCTN.appendChild(followBtn);
        }else{
            userNicknameCTN.style.gridTemplateRows = "1fr";
            userNickname.style.lineHeight="70px";
        }        
        userNicknameCTN.appendChild(userNickname);
        userInfoTag.appendChild(userHeadshotTag);
        userInfoTag.appendChild(userNicknameCTN);
        // 文字內容
        const postCommentTag = document.createElement("div");
        postCommentTag.classList.add("post-comment");
        const stroeNameAddTag = document.createElement("div");
        stroeNameAddTag.classList.add("store-name-add");
        const objTitleTag = document.createElement("div");
        objTitleTag.classList.add("obj-title");
        objTitleTag.textContent = "店家名稱";
        const storeNameTag = document.createElement("p");
        storeNameTag.classList.add("store-name");
        storeNameTag.textContent=String(dt[i].post.name);
        stroeNameAddTag.appendChild(objTitleTag);
        stroeNameAddTag.appendChild(storeNameTag);

        const foodExperienceTag = document.createElement("div");
        foodExperienceTag.classList.add("food-experience");
        const objTitleExTag = document.createElement("div");
        objTitleExTag.classList.add("obj-title");
        objTitleExTag.textContent="食物體驗";
        const experienceTextTag = document.createElement("p");
        experienceTextTag.classList.add("experience-text");
        experienceTextTag.textContent=String(dt[i].post.comment);
        foodExperienceTag.appendChild(objTitleExTag);
        foodExperienceTag.appendChild(experienceTextTag);

        const diningAreaTag = document.createElement("div");
        diningAreaTag.classList.add("dining-area");
        const objTitleAreaTag = document.createElement("div");
        objTitleAreaTag.classList.add("obj-title");
        objTitleAreaTag.textContent="用餐環境";
        const areaTextTag = document.createElement("p");
        areaTextTag.classList.add("area-text");
        areaTextTag.textContent=String(dt[i].post.area);
        diningAreaTag.appendChild(objTitleAreaTag);
        diningAreaTag.appendChild(areaTextTag);
        postCommentTag.appendChild(stroeNameAddTag);
        postCommentTag.appendChild(foodExperienceTag);
        postCommentTag.appendChild(diningAreaTag);

        postContentCommTag.appendChild(userInfoTag);
        postContentCommTag.appendChild(postCommentTag);
        // 下層結束

        postContentCTNTag.appendChild(postContentImgTag);
        postContentCTNTag.appendChild(postContentCommTag);

        if (dt[i].post.img.length > 1){
            // 滑動的按鈕容器
            slideBtnTag.style.display = "flex";
        }

        // 滑到最左邊
        foodImgInfoTag.scrollTo({
            left: 0,
            behavior: 'smooth' 
        });

        indexM.postLikeAndFavoriteBtn(userId, loveBtnTag, collectBtnTag, loveBtnImgTag, collectBtnImgTag);
        postsCTNTag.appendChild(postContentCTNTag); 

        if (dt[i].user.user_id !== userId){
            postFollowBtn(followBtn);
        }
    }

    const spaceTag = document.createElement("div");
    spaceTag.classList.add("space");
    postsCTNTag.appendChild(spaceTag);   
};

async function get_user_position() {
    // 確認是否支援定位功能
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            // 因為此方法為非同步執行，如果要在執行的function中，設置一些參數。
            // 需要使用callback的方式，確認收到值才會執行(也可以使用promise的方法)
            (position) => {get_position_func(position)}, 
            get_position_error, 
            );
    }else{
        console.log("使用者的瀏覽器不支援取定位的功能");
    }
}

async function get_position_func(position) {
    const lat_pos = position.coords.latitude;
    const lon_pos = position.coords.longitude;

    indexM.lat = lat_pos;
    indexM.lon = lon_pos;
    indexM.rejectPosition = false;

    searchPosts();
}

async function get_position_error(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.error("使用者拒絕使用定位功能");
            rejectPositionGetCountryAndCity();
            break;
        case error.POSITION_UNAVAILABLE:
            rejectPositionGetCountryAndCity();
            break;
        case error.UNKNOWN_ERROR:
            rejectPositionGetCountryAndCity();
            break;
    }
};

async function rejectPositionGetCountryAndCity() {
    indexM.countrySelect.textContent = "臺灣";
    await createCityOptionItem("臺灣");
    indexM.citySelect.textContent = "臺北市";
    indexM.countryName="臺灣";
    indexM.cityName=["臺北市", "", ""];
    await createTypesOptionItem("臺灣", "臺北市");
    searchPosts();
}

// 登入後
async function headshotFunc() {
    const memberCenterBtn = document.querySelector(".headshot-item-img");
    if (memberCenterBtn){
        memberCenterBtn.dataset.userId=userId;
        memberCenterBtn.addEventListener("click", () => {
            const result = document.cookie.includes("my_eatweb_isLogged_here=true");
            if (result){
                memberCenter();
            }
        });
    }
}

async function memberCenter() {
    loaderUI.classList.toggle(`active`);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.location.replace(`/member`);
            }, 300);
           
        });
    });
}

// 點擊貼文大頭照，可以進到會員中心
async function otherMemberCenter(id) {
    loaderUI.classList.toggle(`active`);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.location.replace(`/othermember?memb_id=${id}`);
            }, 300);
           
        });
    });
}

async function setMemberInfo(imgNm, user_name, nickname) {
    // 修改大頭照
    const headshotUrl = await indexM.getHeadshotUrl(imgNm)
    if (imgNm === null){
        indexV.setHeadshotImg(imgNm);
    }else{
        indexV.setHeadshotImg(headshotUrl);
    }

    // 修改使用者名稱
    if (String(nickname) !== ""){
        indexV.settingName(nickname);
    }else{
        indexV.settingName(user_name);
    }
}

async function ownPostSearch(){
    if (indexM.ownSearchBtn){
        indexM.ownSearchBtn.addEventListener("click", async () => {
            const result = document.cookie.includes("my_eatweb_isLogged_here=true");
            if (result){
                const dtJson = await indexM.ownBtnProcessing(userId);

                // 將追蹤按鈕名稱移除改為預設
                const followBtn = document.querySelector(".btn-tracker");
                followBtn.textContent = "追蹤者";

                genMarker(dtJson);
            }else{
                // 跳出登入視窗
                indexM.openLoginAndSigninDialog();
            }
        });
    };
}


async function followPostSearch(id) {
    const followBtn = document.querySelector(".btn-tracker");
    if (followBtn){
        followBtn.addEventListener("click", async () => {
            const result = document.cookie.includes("my_eatweb_isLogged_here=true");
            if (result){
                indexM.followBtnProcessing();
            }else{
                // 跳出登入視窗
                indexM.openLoginAndSigninDialog();
            }
        });
    }

    const result = document.cookie.includes("my_eatweb_isLogged_here=true");
    if (result){
        document.addEventListener("click", (e) => {
            // 若都不是點擊在這些下拉式物件時，才會將所有的下拉式關閉
            if (!followBtn.contains(e.target)){
                indexM.followItemHidden();
            }
        })

        createFollowUser(id);
    }
};

async function collectPostSearch(){
    if (indexM.collectSearchBtn){
        indexM.collectSearchBtn.addEventListener("click", async () => {
            const result = document.cookie.includes("my_eatweb_isLogged_here=true");
            if (result){
                const dtJson = await indexM.collectBtnProcessing(userId);

                // 將追蹤按鈕名稱移除改為預設
                const followBtn = document.querySelector(".btn-tracker");
                followBtn.textContent = "追蹤者";

                genMarker(dtJson);
            }else{
                // 跳出登入視窗
                indexM.openLoginAndSigninDialog();
            }
        });
    };
}

async function genMarker(dtJson) {
    if (dtJson !== null && dtJson !== "取消"){
        clearMarker();

        for(let i=0; i<dtJson.length; i++){
            const markerObj = await indexV.marker(map, { lat: dtJson[i].lat, lng: dtJson[i].lon,}, dtJson[i].img);
            markerObj.postId = dtJson[i].post_id;
            markerObj.addEventListener("click", async () => {
                const result = await indexM.getStorePosts(userId, markerObj.position.lat, markerObj.position.lng);
                if (result !== null){
                    indexM.openPostsContent();
                    await modifyPostInfoInDialog(result);
                    indexM.slideBtnClick();
                }
            });

            markerArr.push(markerObj);
        }

        if (indexM.rejectPosition === true){
            // 找出當下位置
            const country = indexM.countryName;
            const city = indexM.cityName;
            const {lat, lng} = await indexM.searchPosition(country, city[0]);

            if (lat !== "nan" && lng !== "nan"){
                indexM.lat = lat;
                indexM.lon = lng;
                const newPosition = {
                    lat: lat, 
                    lng: lng
                }
                map.panTo(newPosition);
            }
        }else{
            const newPosition = {
                lat: indexM.lat, 
                lng: indexM.lon
            }
            map.panTo(newPosition);
        }

        if (dtJson.length === 0){
            explainToast.fire({
                icon: "info",
                title: "抱歉，沒搜尋到相關的貼文。",
            });
        }

    }else if (dtJson === null){
        explainToast.fire({
            icon: "info",
            title: "抱歉，沒搜尋到相關的貼文。",
        });
    }
}

async function postFollowBtn(followBtnObj) {
    if (followBtnObj){
        followBtnObj.addEventListener("click", async function() {
            const visitorResult = document.cookie.includes("my_eatweb_isLogged_here=true");
            if (visitorResult){
                const result = await indexM.setPostFollowBtn(followBtnObj, userId);
                if (result !== false){
                    await createFollowUser(userId);
                };
            }else{
                // 顯示登入畫面
                indexM.openLoginAndSigninDialog();
            }
        });
    }
}

async function addPostFunc() {
    const postAddBtn = document.querySelector(".post-add");
    if (postAddBtn){
        const result = document.cookie.includes("my_eatweb_isLogged_here=true");
        if (result){
            postAddBtn.addEventListener("click", () => {
                loaderUI.classList.toggle(`active`);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            window.location.replace("/postcomment");
                        }, 300);
                        
                    });
                });           
            });
        }
    }
}


async function searchDistanceBtn() {
    if (indexM.distanceOneBtn){
        indexM.distanceOneBtn.addEventListener("click", async function() {
            indexM.searchDisNum = 1;
            indexM.disOneClick();
            indexM.distanceBtnHidden();
        });
    };

    if (indexM.distanceThreeBtn){
        indexM.distanceThreeBtn.addEventListener("click", async function() {
            indexM.searchDisNum = 5;
            indexM.disThreeClick();
            indexM.distanceBtnHidden();
        });
    };

    if (indexM.distanceFiveBtn){
        indexM.distanceFiveBtn.addEventListener("click", async function() {
            indexM.searchDisNum = 10;
            indexM.disFiveClick();
            indexM.distanceBtnHidden();
        });
    };
}

// 開啟登入視窗
const loggedBtn = document.querySelector(".log-in-btn");
if (loggedBtn){
    loggedBtn.addEventListener("click", async function() {
        indexM.openLoginAndSigninDialog();
    });
}

// 關閉視窗
const closeDialogBtn = document.querySelector(".close-img-btn");
if (closeDialogBtn){
    closeDialogBtn.addEventListener("click", () => {
        indexM.closeLoginAndSigninDialog();
    });
}

verify_user_token();

loadingMap();
window.initMap = initMap;

createOptionItem();
createCityOptionItem("");

searchBarOptionClick();
ownPostSearch();
collectPostSearch();

// 當網頁載入時，要執行此部分
window.addEventListener("load", () => {
    setTimeout(
        get_user_position,
        3000
    );
    
});

searchDistanceBtn();
