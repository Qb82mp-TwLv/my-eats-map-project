import editPostM from "./model/editpost-m.js";
import editPostV from "./view/editpost-v.js";


const querySearch = window.location.search;
const param = new URLSearchParams(querySearch);
const postId = param.get('post_id');

const loaderUI = document.querySelector(".loading-container");
let userId=null;
async function verify_user_token() {
    try{
        const response = await fetch("/api/user/auth", {
            method: "GET",
            credentials: "include"
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

        userId=dt.data.id;
        await createPostOptionItem();
        await optionInit();
        await editPostContent(userId);
        await deleteEditImg();
        setSlideBtn();
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
    const typeStr = await editPostM.getTypesOptionName();
    const types = typeStr.data.types;
    if (countryStr !== null && typeStr !== null){
        const countryStrSplit = countryStr.split(",");
        const countrySelect = document.querySelector(".country-select");

        for(let i=0; i< countryStrSplit.length; i++){
            const optionTag = editPostV.countryDropList(countryStrSplit[i]);
            optionTag.addEventListener("click", () => {
                countrySelect.textContent = countryStrSplit[i];
                createPortCityOptionItem(countryStrSplit[i]);
            });
        };
  
        for(let i=0; i< types.length; i++){
            const optionTag = editPostV.typesDropList(types[i]);
            editPostM.typesOptionItemClick(optionTag);
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
    
    const cityArr = await editPostM.getCityOptionName(country);
    const city = cityArr.city;
    for(let i=0; i< city.length; i++){
        const optionTag = editPostV.cityDropList(city[i]);
        editPostM.cityOptionItemClick(optionTag);
    };
    
    editPostM.citySelectText();
}

const memberCenterBtn = document.querySelector(".navbar-btn");
if (memberCenterBtn){
    memberCenterBtn.addEventListener("click", () => {
        editPostM.memberCenter();
    });
}

const homePage = document.querySelector(".navbar-title");
if (homePage){
    homePage.addEventListener("click", () => {
        editPostM.homePage();
    });
}

async function optionInit() {
    const countryDroplist = document.querySelector(".country-select");
    countryDroplist.addEventListener("click", () => {
        editPostM.countryOptionClick();
    });

    const cityDroplist = document.querySelector(".city-select");
    cityDroplist.addEventListener("click", () => {
        editPostM.cityOptionClick();
    });

    const typeDroplist = document.querySelector(".type-select");
    typeDroplist.addEventListener("click", () => {
        editPostM.typeOptionClick();
    });

    document.addEventListener("click", (e) => {
        if (!countryDroplist.contains(e.target) && !cityDroplist.contains(e.target) && !typeDroplist.contains(e.target)){
            editPostM.droplistOptionHidden();
        }
    });
};

let imgNameArr = [];
let delImgNameArr = [];
// 將取得的資料，回填至物件中
async function editPostContent() {
    const editData = await editPostM.editPostInfo(postId, userId);
    if (editData !== null){
        const dt = editData.data;
        const country = String(dt.country);
        await createPortCityOptionItem(country);
        await editPostV.createPriviewImg(dt);
        getImgName(dt.img);
        return;
    }

    const explainToast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
    });
    explainToast.fire({
        icon: "error",
        title: "編輯網頁取資料失敗",
        text: "由於編輯網頁取資料發生錯誤，因此會回到會員中心頁面。",
    });
    // setTimeout(() => {
    //     editPostM.memberCenter();
    // }, 3100);
}

async function setSlideBtn() {
    editPostM.slideBtnClick();
}

async function getImgName(dt) {
    for (let i=0; i < dt.length; i++){
        const imgSplit = dt[i].split("/");
        const imgName = imgSplit[3];
        imgNameArr.push(imgName);
    }
}

async function deleteEditImg() {
    const delImgArr = document.querySelectorAll(".del-img-btn");
    
    delImgArr.forEach(function(item) {
        item.addEventListener("click", async function() {
            editPostM.openAskDialog();
            const imgIdx = item.dataset.imgIdx;
            const editAskDeleteBtn = document.querySelector(".ask-delete-btn");
            editAskDeleteBtn.dataset.imgIdx = imgIdx;
        });
    }); 
    
    askDelBtn();
}

function askDelBtn() {
    const editAskDeleteBtn = document.querySelector(".ask-delete-btn");
    if (editAskDeleteBtn){
        editAskDeleteBtn.addEventListener("click", async function() {
            editPostM.closeAskDialog();
            const explainToast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2000,
            });

            const imgIdx=editAskDeleteBtn.dataset.imgIdx;
            const result = await delImgAction(imgIdx);
            if (result === false){
                explainToast.fire({
                    icon: "error",
                    title: "圖片刪除失敗",
                });
                return;
            }

            explainToast.fire({
                icon: "success",
                title: "圖片刪除成功",
            });
        });
    };
    }

const editAskCancelBtn = document.querySelector(".ask-cancel-btn");
if (editAskCancelBtn){
    editAskCancelBtn.addEventListener("click", function() {
        editPostM.closeAskDialog();
    });
};

async function delImgAction(idx) {
    const imgSlideObj = document.querySelectorAll(".imgSlides");
    let result=false;
    for(let i=0; i<imgSlideObj.length; i++){
        if (imgSlideObj[i].dataset.imgIdx === idx){
            const imgObj = imgSlideObj[i].querySelector("img");
            const imgSrc = imgObj.src;
            const imgSplit = imgSrc.split("/");
            const imgName = imgSplit[3];
            // 要刪除的圖片
            delImgNameArr.push(imgName);
            // 沒有要刪除的圖片
            imgNameArr.splice(idx, 1);
            // 移除物件
            imgSlideObj[i].remove();
            editPostV.updatePreviewImgCTN();
            if (imgNameArr.length === 1){
                const delBtn = document.querySelector(".del-img-btn");
                delBtn.style.display="none";
                const slideCTN = document.querySelector(".sildeBtn");
                slideCTN.style.display = "none";
            };
            result=true;
            break;
        }
    }

    return result;
}

const saveEditBtn = document.querySelector(".submit-btn");
if (saveEditBtn){
    saveEditBtn.addEventListener("click", async function() {
        const result = await editPostM.saveEditPostInfo(postId, userId, imgNameArr, delImgNameArr);

        const explainToast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
        });

        if (result === false){
            explainToast.fire({
                icon: "error",
                title: "編輯貼文失敗",
            });
            return;
        }

        explainToast.fire({
            icon: "success",
            title: "編輯貼文成功",
        });
        loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/member");
                }, 300);
            });
        });
    });
}

verify_user_token();
