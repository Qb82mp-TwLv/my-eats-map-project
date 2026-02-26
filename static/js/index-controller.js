import indexM  from './model/index-m.js';
import indexV  from './view/index-v.js';

async function verify_user_token() {
    try{
        const token = localStorage.getItem("token");

        const response = await fetch("/api/user/auth", {
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`}
        });

        const dt = await response.json();
        if (dt.data === null){
            window.location.href = "/login";
        }

        set_headshot_img(dt.data.headshot);
    }catch(error){
        window.location.href = "/login";
        //console.log(error);
    }
};

async function loadingMap() {
    const mapkey = await indexM.getMapValue();

    const mapScript = document.createElement("script");
    mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapkey}&loading=async&callback=initMap&libraries=marker`;
    mapScript.async = true;
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
        zoom: 10,
        tilt:0,
        heading: 0,
        rotateControl: false,
    });

    const markerObj = await indexV.marker(map, { lat: 25.03420, lng: 121.56452,}, "測試");
    markerObj.addEventListener("click", () => {
        indexM.openPostsContent();
    });
}


async function createOptionItem() {
    // 取得地區(國家)
    const dt = await indexM.getCountryOptionName();
    // 建立地區的droplist
    const countryArr = dt.data;
    const country = countryArr.country;
    const countrySelect = document.querySelector(".country-select");
    sessionStorage.setItem("country", country);
    for(let i=0; i< country.length; i++){
        const optionTag = indexV.countryDropList(country[i]);
        optionTag.addEventListener("click", () => {
            countrySelect.textContent = country[i];
            createCityOptionItem(country[i]);
            console.log(optionTag.textContent);
        });
    };

    const typesDt = await indexM.getTypesOptionName();
    const typesArr = typesDt.data;
    const types = typesArr.types;
    sessionStorage.setItem("type", types);
    for(let i=0; i< types.length; i++){
        const optionTag = indexV.typesDropList(types[i]);
        indexM.typesOptionItemClick(optionTag);
    };
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
        indexM.cityOptionItemClick(optionTag);
    };
    
    indexM.citySelectText();
    
}

async function userHeadshot() {
    const headshotImg = document.querySelector(".headshot-item-img");
    if (headshotImg){
        headshotImg.src = "/static/img/nginx.png";
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

const searchBtn = document.querySelector(".input-item-btn");
if (searchBtn){
    searchBtn.addEventListener("click", () => {
        searchPosts();
    });
}

async function searchPosts() {
    // 取得選項
    const country = indexM.countrySelect.textContent;
    const city = indexM.citySelect.textContent;
    const storeType = indexM.typesSelect.textContent;

    if (country!=="選擇地區" && city!=="選擇城市" && storeType!=="店家種類"){
        // 找出當下位置
        const {lat, lng} = await indexM.searchPosition(country, city);

        if (lat !== "nan" && lng !== "nan"){
            const newPosition = {
                lat: lat, 
                lng:lng
            }
            map.panTo(newPosition);
        }
    }
}

async function get_user_position() {
    // 確認是否支援定位功能
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(indexM.get_position_func, indexM.get_position_error, indexM.options);
    }else{
        console.log("使用者的瀏覽器不支援取定位的功能");
    }
}

const memberCenterBtn = document.querySelector(".headshot-item-img");
if (memberCenterBtn){
    memberCenterBtn.addEventListener("click", () => {
        memberCenter();
    });
}
async function memberCenter() {
    window.location.href = "/member";
    // url = "/member";
    // // 需要取得member的id，才能知道是誰
    // // 換網址
    // window.history.pushState({}, '', url);
    // // 重新load網頁的DOM
    // document.body.replaceChildren();

    // const response = await fetch(url, {
    //     method: "GET",
    //     headers: {
    //         'X-Requested-With': 'XMLHttpRequest'
    //     }
    // });
    // const html = await response.text();

    // const htmlDOM = new DOMParser();
    // const getHtml = htmlDOM.parseFromString(html, 'text/html');
    // upda
    // document.body.re
}

async function set_headshot_img(img) {
    const headshot_obj = document.querySelector(".headshot-item-img");

    switch (img){
        case null:
            headshot_obj.src = "/static/img/user.png";
            break;
        default:
            headshot_obj.src = "/static/img/nginx.png";
    }
        

}

verify_user_token();

loadingMap();
window.initMap = initMap;

userHeadshot();
createOptionItem();
createCityOptionItem("");

searchBarOptionClick();

// 當網頁載入時，要執行此部分
window.addEventListener("load", () => {
    setTimeout(
        get_user_position,
        1000
    );
    
});
