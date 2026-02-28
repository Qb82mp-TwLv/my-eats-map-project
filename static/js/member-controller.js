import memberM from './model/member-m.js';
import memberV from './view/member-v.js';

let userId = null;
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

        set_member_info(dt.data);
        userId = dt.data.id;
        console.log(userId);
    }catch(error){
        window.location.href = "/login";
        //console.log(error);
    }
};

async function set_member_info(dt) {
    let name = dt.nickname;
    if (String(name) !== ""){
        memberV.settingName(name);
    }else{
        name = dt.name;
        memberV.settingName(name);
    }
    
    if (dt.headshot === ""){
        memberV.settingHeadshot(null);
    }else{
        const headshotUrl = await memberM.getHeadshotUrl(dt.headshot)
        memberV.settingHeadshot(headshotUrl);
    }
    
    setTrackerNumber(dt.id);
    setFansNumber(dt.id);
    memberPostAndCollectSwitchButton(dt.id);
    setChangeImg(dt.id);
    headshotUpdate(dt.headshot);

    const postsData = await memberM.getAllPosts(dt.id);
    memberV.genPostsInMember(postsData);
    
    singlePostLikeAndFavoriteBtn(dt.id);
}

async function setTrackerNumber(id) {
    const trackerCountText = document.querySelector(".tracker-number-info");
    if (trackerCountText){
        const trackerNum = await memberM.get_tracker_number(id);
        trackerCountText.textContent = String(trackerNum);
    }
};

async function setFansNumber(id) {
    const fansCountText = document.querySelector(".fans-number-info");
    if (fansCountText){
        const fansNum = await memberM.get_fans_number(id);
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
            memberM.switchToPostsCTN();
        };

        await mutationPostObs();
        const postData = await memberM.getAllPosts(id);
        memberV.genPostsInMember(postData);     
    });

    // 收藏按鈕要使用active
    // 並隱藏post的部分，與按鈕要取消active
    collectBtn.addEventListener("click", async function() {
        if (!collectBtn.classList.contains("active")){
            collectBtn.classList.toggle("active");
            postsBtn.classList.remove("active");
            memberM.switchToCollectCTN();
        };

        await mutationCollectObs();
        const collectData = await memberM.getAllCollect(id);
        memberV.genCollectInMember(collectData);
    });
}


const selectImgBtn = document.querySelector(".add-img");
if (selectImgBtn){
    selectImgBtn.addEventListener("click", () => {
        memberM.changeImg();
    });
}

async function headshotUpdate(imgNM){
    const submitUserImgBtn = document.querySelector(".submit-btn"); 
    if (submitUserImgBtn){
        submitUserImgBtn.addEventListener("click", async () => {
            const url = await memberM.submitHeadshotImg(imgNM);
            if (url !== null){
                memberV.settingHeadshot(url);
                memberM.closeSelectHeadshot();
            }

            setTimeout(() => {
                location.reload();
            }, 1500);
        });
    }
}

async function setChangeImg(id) {
    const selectHeadshotBtn = document.querySelector(".change-img-btn");
    if (selectHeadshotBtn){
        selectHeadshotBtn.addEventListener("click", () => {        
            memberM.openSelectHeadshot(id);
        });
    }
}

const settingMemberBtn = document.querySelector(".navbar-setting");
if (settingMemberBtn){
    settingMemberBtn.addEventListener("click", () => {
        memberM.settingMemberInfo();
    });
}

const homePage = document.querySelector(".navbar-title");
if (homePage){
    homePage.addEventListener("click", () => {
        memberM.homePage();
        console.log("5執行");
    });
}

const postAddBtn = document.querySelector(".post-add");
if (postAddBtn){
    postAddBtn.addEventListener("click", () => {
        memberM.postAPost();
    });
}


async function postEachOneClick() {
    const postImgBtn = document.querySelectorAll(".post-img");
    let i = 0;
    while (i < postImgBtn.length){
        const postB = postImgBtn[i];
        if (postB){
            postB.addEventListener("click", async function(){
                memberM.openPostDialog();
                console.log(postB);

                const likeCountNum = document.querySelector(".like-count");
                const collectCountNum = document.querySelector(".collect-count");

                const postId = postB.dataset.postId;
                const postData = await memberM.getPostContent(postId, userId);
                if (postData !== null){
                    memberV.modifyPostInfoInDialog(postData);
                    likeCountNum.dataset.postId=postId;
                    collectCountNum.dataset.postId = postId;
                }
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
            const count = memberV.postCount;

            // tag.addedNodes.forEach((node) => {
            //     console.log("偵測到新節點：", node);
            // });

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
            const count = memberV.collectCount;

            // tag.addedNodes.forEach((node) => {
            //     console.log("偵測到新節點：", node);
            // });

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

async function setSlideBtn() {
    memberM.slideBtnClick();
}

async function singlePostLikeAndFavoriteBtn(id) {
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
                memberM.likeCountSubmit(id, postId, "yes");
            }else{
                postlikeBtn.src = "/static/img/heart-nocolor.png";
                postlikeBtn.dataset.like="no";
                likeCount = parseInt(likeCountNum.textContent) - 1;
                likeCountNum.textContent = String(likeCount);

                const postId = parseInt(likeCountNum.dataset.postId);
                memberM.likeCountSubmit(id, postId, "no");
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
                memberM.collectCountSubmit(id, postId, "yes");
            }else{
                postCollecteBtn.src = "/static/img/bookmark-nocolor.png";
                postCollecteBtn.dataset.collect="no";
                collectCount = parseInt(collectCountNum.textContent) - 1;
                collectCountNum.textContent = String(collectCount);

                const postId = parseInt(collectCountNum.dataset.postId);
                memberM.collectCountSubmit(id, postId, "no");
            }
        });
    };
}

verify_user_token();
setSlideBtn();