import othermemberM from "./model/othermember-m.js";
import othermemberV from "./view/othermember-v.js";


const explainToast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 1000,
});


// 開啟的會員頁面，該會員的資訊
let otherMembId = null;
// 進到該會員頁面的使用者資訊
let userId = null;
const loaderUI = document.querySelector(".loading-container");
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
                        window.location.replace("/");
                    }, 300);
                    
                });
            });
        }

        // 取得網址的user資訊
        const querySearch = window.location.search;
        const param = new URLSearchParams(querySearch);
        const membId = param.get('memb_id');
        otherMembId = membId;

        const membdt = await othermemberM.membInfo(otherMembId);
        if (membdt !== null){
            userId = dt.data.id;
            setMemberInfo(membdt);
            // 確認進到此會員頁面的使用者，設定按讚、收藏資訊
            singlePostLikeAndFavoriteBtn(userId);
        }else{
            explainToast.fire({
                icon: "error",
                title: "抱歉，會員資訊有問題，將回到首頁。",
            });

            loaderUI.classList.toggle('active');
            requestAnimationFrame(() => (
                requestAnimationFrame(()=> {
                    setTimeout(() => {
                        window.location.replace("/");
                    }, 1000);
                })
            ));
        }

    }catch(error){
        loaderUI.classList.toggle('active');
        requestAnimationFrame(() => (
            requestAnimationFrame(()=> {
                setTimeout(() => {
                    window.location.replace("/");
                }, 300);
            })
        ));
    }
};

async function setMemberInfo(dt) {
    set_member_info(dt);
}

async function set_member_info(dt) {
    let name = dt.nickname;
    if (String(name) !== ""){
        othermemberV.settingName(name);
    }else{
        name = dt.name;
        othermemberV.settingName(name);
    }
    
    if (dt.headshot === null){
        othermemberV.settingHeadshot(null);
    }else{
        const headshotUrl = await othermemberM.getHeadshotUrl(dt.headshot)
        othermemberV.settingHeadshot(headshotUrl);
    }
    // 追蹤人數
    setTrackerNumber(dt.id);
    // 粉絲人數
    setFansNumber(dt.id);
    // 粉絲資訊
    fansOptionItem(dt.id);
    // 切換發文與收藏的按鈕
    memberPostAndCollectSwitchButton(dt.id);
    // 取會員面的會員發文、收藏資料
    const postsData = await othermemberM.getAllPosts(dt.id);
    othermemberV.genPostsInMember(postsData);
}

async function setTrackerNumber(id) {
    const trackerCountText = document.querySelector(".tracker-number-info");
    if (trackerCountText){
        const trackerNum = await othermemberM.get_tracker_number(id);
        trackerCountText.textContent = String(trackerNum);
    }
};

async function setFansNumber(id) {
    const fansCountText = document.querySelector(".fans-number-info");
    if (fansCountText){
        const fansNum = await othermemberM.get_fans_number(id);
        fansCountText.textContent = String(fansNum);
    }
};

function memberPostAndCollectSwitchButton(id) {
    const postsBtn = document.querySelector(".post-btn");
    const collectBtn = document.querySelector(".post-collect-btn");

    // 發文按鈕要使用active
    // 並隱藏collect的部分，與按鈕要取消active
    postsBtn.addEventListener("click", async function() {
        if (!postsBtn.classList.contains("active")){
            postsBtn.classList.toggle("active");
            collectBtn.classList.remove("active");
            othermemberM.switchToPostsCTN();
        };

        if (othermemberM.postCTN.querySelector(".post-img") === null){
            setTimeout(async () => {
                await mutationPostObs();
                const postData = await othermemberM.getAllPosts(id);
                othermemberV.genPostsInMember(postData); 
            }, 200);
        };
    });

    // 收藏按鈕要使用active
    // 並隱藏post的部分，與按鈕要取消active
    collectBtn.addEventListener("click", async function() {
        if (!collectBtn.classList.contains("active")){
            collectBtn.classList.toggle("active");
            postsBtn.classList.remove("active");
            othermemberM.switchToCollectCTN();
        };

        if (othermemberM.collectCTN.querySelector(".post-img") === null){
            setTimeout(async () => {
                await mutationCollectObs();
                const collectData = await othermemberM.getAllCollect(id);
                othermemberV.genCollectInMember(collectData);
            }, 300);
        };
    });
}

async function setSlideBtn() {
    othermemberM.slideBtnClick();
}

async function  singlePostLikeAndFavoriteBtn(id) {
    const postlikeBtn = document.getElementById("like-btn");
    if (postlikeBtn){
        postlikeBtn.addEventListener("click", function() {
            // 切換圖片顯示
            const imgName = postlikeBtn.dataset.like == "yes";
            const likeCountNum = document.querySelector(".like-count");
            let likeCount=0;
            if (!imgName){
                postlikeBtn.src = "/static/img/heart-color.png";
                postlikeBtn.dataset.like="yes";
                likeCount = parseInt(likeCountNum.textContent) + 1;
                likeCountNum.textContent = String(likeCount);

                const postId = parseInt(likeCountNum.dataset.postId);
                othermemberM.likeCountSubmit(id, postId, "yes");
            }else{
                postlikeBtn.src = "/static/img/heart-nocolor.png";
                postlikeBtn.dataset.like="no";
                likeCount = parseInt(likeCountNum.textContent) - 1;
                likeCountNum.textContent = String(likeCount);

                const postId = parseInt(likeCountNum.dataset.postId);
                othermemberM.likeCountSubmit(id, postId, "no");
            }
        });
    };

    const postCollecteBtn = document.getElementById("favorite-btn");
    if (postCollecteBtn){
        postCollecteBtn.addEventListener("click", function() {
            // 切換收藏圖片
            const imgName = postCollecteBtn.dataset.collect == "yes";
            const collectCountNum = document.querySelector(".collect-count");
            let collectCount = 0;
            if (!imgName){
                postCollecteBtn.src = "/static/img/bookmark-color.png";
                postCollecteBtn.dataset.collect="yes";
                collectCount = parseInt(collectCountNum.textContent) + 1;
                collectCountNum.textContent = String(collectCount);

                const postId = parseInt(collectCountNum.dataset.postId);
                othermemberM.collectCountSubmit(id, postId, "yes");
            }else{
                postCollecteBtn.src = "/static/img/bookmark-nocolor.png";
                postCollecteBtn.dataset.collect="no";
                collectCount = parseInt(collectCountNum.textContent) - 1;
                collectCountNum.textContent = String(collectCount);

                const postId = parseInt(collectCountNum.dataset.postId);
                othermemberM.collectCountSubmit(id, postId, "no");
            }
        });
    };
}


async function postEachOneClick() {
    const postImgBtn = document.querySelectorAll(".post-img");
    let i = 0;
    while (i < postImgBtn.length){
        const postB = postImgBtn[i];
        if (postB){
            postB.addEventListener("click", async function(){
                othermemberM.openPostDialog();

                const likeCountNum = document.querySelector(".like-count");
                const collectCountNum = document.querySelector(".collect-count");

                const postId = postB.dataset.postId;
                const postData = await othermemberM.getPostContent(postId, userId);
                if (postData !== null){
                    othermemberV.modifyPostInfoInDialog(postData);
                    likeCountNum.dataset.postId=postId;
                    collectCountNum.dataset.postId = postId;
                    // 處理圖片的名稱
                    const imgNameArr = [];
                    postData.img.forEach((item, idx) => {
                        const splitItem = item.split("/");
                        imgNameArr.push(splitItem[3]);
                    });
                    
                    othermemberV.viewSlideOrNot(imgNameArr.length);
                }
                setSlideBtn();
            });
        };

        i++;
    }
}

mutationPostObs();
async function mutationPostObs() {
    let getTagCount = 0;

    const observerPost = new MutationObserver(function (tags) {
        tags.forEach(function (tag) {
            getTagCount++;
            const count = othermemberV.postCount;

            if (getTagCount === count){
                observerPost.disconnect();
                try{
                    postEachOneClick();
                }catch{
                    console.log("設置貼文觸發功能發生錯誤。");
                }
            }
        });
    });

    const postContainer = document.querySelector(".posts-content-container");
    const options = {childList: true};

    observerPost.observe(postContainer, options);
}

async function mutationCollectObs() {
    let getTagCount = 0;

    const observerPost = new MutationObserver(function (tags) {
        tags.forEach(function (tag) {
            getTagCount++;
            const count = othermemberV.collectCount;

            if (getTagCount === count){
                observerPost.disconnect();
                try{
                    postEachOneClick();
                }catch{
                    console.log("設置貼文觸發功能發生錯誤。");
                }
            }
        });
    });

    const postContainer = document.querySelector(".collect-content-container");
    const options = {childList: true};

    observerPost.observe(postContainer, options);
}

// 大標題點擊的部分
const homePage = document.querySelector(".navbar-title");
if (homePage){
    homePage.addEventListener("click", () => {
        othermemberM.homePage();
    });
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

// 粉絲資訊顯示下拉式
const fansInfoBtn = document.querySelector(".fans-info-select");
if (fansInfoBtn){
    fansInfoBtn.addEventListener("click", async function() {
        othermemberM.viewFansInfo();
    });
}

document.addEventListener("click", (e) => {
    if (!fansInfoBtn.contains(e.target)){
        othermemberM.droplistOptionHidden();
    }
}); 

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

function postHeadshotClcik(fansHeadshotTag) {
    fansHeadshotTag.addEventListener("click", async function() {
        if (parseInt(fansHeadshotTag.dataset.userNum) === userId){
            memberCenter();
        }else{
            otherMemberCenter(fansHeadshotTag.dataset.userNum);
        } 
    });
}

async function postFollowBtn(followBtnObj) {
    if (followBtnObj){
        followBtnObj.addEventListener("click", async function() {
           const result = await othermemberM.setPostFollowBtn(followBtnObj, userId);
        });
    }
}

function genFansOption(dt) {
    const fansInfoOption = document.querySelector(".fans-info-option");
    if (fansInfoOption){
        // 清除原本的資料
        fansInfoOption.textContent= "";

        for(let i=0; i<dt.length; i++){
            const fansOptionTag = document.createElement("li");
            fansOptionTag.classList.add("fans-option");

            const fansHeadshotTag = document.createElement("img");
            fansHeadshotTag.classList.add("fans-headshot");
            if (dt[i].headshot === null){
                fansHeadshotTag.src= "/static/img/user.png";
            }else{
                fansHeadshotTag.src = String(dt[i].headshot);
            }
            
            fansHeadshotTag.dataset.userNum = String(dt[i].id);
            postHeadshotClcik(fansHeadshotTag);
            const fansNameTag = document.createElement("div");
            fansNameTag.classList.add("fans-name");
            fansNameTag.textContent =  String(dt[i].name);

            fansOptionTag.appendChild(fansHeadshotTag);
            fansOptionTag.appendChild(fansNameTag);

            // 追蹤的按鈕
            const followBtnTag = document.createElement("button");
            followBtnTag.type="button";

            if (dt[i].id !== userId){
                followBtnTag.classList.add("follow-btn");
                followBtnTag.dataset.userId=String(dt[i].id);
                followBtnTag.dataset.follow=String(dt[i].follow);
                if (String(dt[i].follow) === "no"){
                    followBtnTag.textContent="追蹤";
                }else{
                    followBtnTag.textContent="取消追蹤";
                }
                fansOptionTag.appendChild(followBtnTag);
            }

            fansInfoOption.appendChild(fansOptionTag);

            if (dt[i].id !== userId){
                postFollowBtn(followBtnTag);
            }
        }
    }
}

// 取的粉絲資料，並將資料建置於下拉式中
async function fansOptionItem(id) {
    // 先取得粉絲的資訊
    const fansInfo = await othermemberM.getFansInfo(id, userId);
    if (fansInfo !== null){
        genFansOption(fansInfo);
    }
}

verify_user_token();
setSlideBtn();