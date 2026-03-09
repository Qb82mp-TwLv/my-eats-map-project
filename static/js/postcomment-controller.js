import postCommentM from './model/postcomment-m.js';
import postCommentV from './view/postcomment-v.js';



const loaderUI = document.querySelector(".loading-container");
async function verify_user_token() {
    try{
        const token = localStorage.getItem("token");

        const response = await fetch("/api/user/auth", {
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`}
        });

        const dt = await response.json();
        if (dt.data === null){
            loaderUI.classList.toggle('active');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        window.location.replace("/login");
                    }, 300);
                    
                });
            });
        }

        postAction(dt.data.id);
    }catch(error){
        loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/login");
                }, 300);
            });
        });
    }
};

async function createPostOptionItem() {
    const countryStr = sessionStorage.getItem("country");
    const typeStr = sessionStorage.getItem("type");
    if (countryStr !== null && typeStr !== null){
        const countryStrSplit = countryStr.split(",");
        const typeStrSplit = typeStr.split(",");
        const countrySelect = document.querySelector(".country-select");

        for(let i=0; i< countryStrSplit.length; i++){
            const optionTag = postCommentV.countryDropList(countryStrSplit[i]);
            optionTag.addEventListener("click", () => {
                countrySelect.textContent = countryStrSplit[i];
                createPortCityOptionItem(countryStrSplit[i]);
            });
        };
  
        for(let i=0; i< typeStrSplit.length; i++){
            const optionTag = postCommentV.typesDropList(typeStrSplit[i]);
            postCommentM.typesOptionItemClick(optionTag);
        };
    }
}

async function createPortCityOptionItem(country) {
    const cityOption = document.querySelector(".city-option");
    const childNode = cityOption.querySelectorAll("li");
    if (childNode){
        childNode.forEach(child => {
            child.remove();
        });
    }
    
    const cityArr = await postCommentM.getCityOptionName(country);
    const city = cityArr.city;
    for(let i=0; i< city.length; i++){
        const optionTag = postCommentV.cityDropList(city[i]);
        postCommentM.cityOptionItemClick(optionTag);
    };
    
    postCommentM.citySelectText();
}

const memberCenterBtn = document.querySelector(".navbar-btn");
if (memberCenterBtn){
    memberCenterBtn.addEventListener("click", () => {
        postCommentM.memberCenter();
    });
}

const homePage = document.querySelector(".navbar-title");
if (homePage){
    homePage.addEventListener("click", () => {
        postCommentM.homePage();
    });
}

async function optionInit() {
    const countryDroplist = document.querySelector(".country-select");
    countryDroplist.addEventListener("click", () => {
        postCommentM.countryOptionClick();
    });

    const cityDroplist = document.querySelector(".city-select");
    cityDroplist.addEventListener("click", () => {
        postCommentM.cityOptionClick();
    });

    const typeDroplist = document.querySelector(".type-select");
    typeDroplist.addEventListener("click", () => {
        postCommentM.typeOptionClick();
    });

    document.addEventListener("click", (e) => {
        // 若都不是點擊在這些下拉式物件時，才會將所有的下拉式關閉
        if (!countryDroplist.contains(e.target) && !cityDroplist.contains(e.target) && !typeDroplist.contains(e.target)){
            postCommentM.droplistOptionHidden();
        }
    });
};

async function postBtnSetting() {
    const selectFoodImgBtn = document.querySelector(".add-img");
    if (selectFoodImgBtn){
        selectFoodImgBtn.addEventListener("click", () => {
            const fileUpload = document.getElementById("image-upload");
            const maxImgFileSum = 7;
            fileUpload.addEventListener("change", async function() {         
                if (this.files.length > maxImgFileSum){
                    this.value="";
                    alert("最多只能選取7張圖，請重新選擇。");
                    return;
                }

                if (this.files.length > 0){
                    postCommentM.imgFiles = this.files;
                    if (this.files.length > 1){
                        // 滑動的按鈕容器
                        const slideCTN = document.querySelector(".sildeBtn");
                        slideCTN.style.display = "flex";
                    }
                }else{
                    postCommentM.imgFiles = null;
                }

                await postCommentV.deletePreviewImgTag();
                // 使用for迴圈將圖片依序帶出來
                for (const img of this.files){
                    postCommentV.createPriviewImg(img);
                }
            });
            
        });
    }
}


const addFoodNmPriceBtn = document.querySelector(".add-object");
let addCount = 0;
if (addFoodNmPriceBtn){
    addFoodNmPriceBtn.addEventListener("click", () => {
        if (addCount < 6){
            postCommentV.addFoodNameAndPriceInput();
            addCount++;
            return;
        }
        console.log("最多只能新增6次。");
    });
}

async function postAction(id) {
    const postSubmitBtn = document.querySelector(".submit-btn");
    if (postSubmitBtn){
        postSubmitBtn.addEventListener("click", async () => {
            const result = await postCommentM.submitPostInfo(id);
            if (result.ok !== true){
                alert(result);
                return;
            }

            postCommentM.loaderUI.classList.toggle('active');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        window.location.replace("/member");
                    }, 500);
                });
            });
            
        });
    }
}

async function setSlideBtn() {
    postCommentM.slideBtnClick();
}


verify_user_token();
createPostOptionItem();
createPortCityOptionItem("");
optionInit();
setSlideBtn();
postBtnSetting();