import memberM from './model/member-m.js';
import memberV from './view/member-v.js';


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
                        window.location.replace("/login");
                    }, 300);
                    
                });
            });
        }

        set_member_info(dt.data);
        userId = dt.data.id;
    }catch(error){
        loaderUI.classList.toggle('active');
        requestAnimationFrame(() => (
            requestAnimationFrame(()=> {
                setTimeout(() => {
                    window.location.replace("/login");
                }, 300);
            })
        ));
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
    
    if (dt.headshot === null){
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

        if (memberM.postCTN.querySelector(".post-img") === null){
            setTimeout(async () => {
                await mutationPostObs();
                const postData = await memberM.getAllPosts(id);
                memberV.genPostsInMember(postData); 
            }, 200);
        };
    });

    // 收藏按鈕要使用active
    // 並隱藏post的部分，與按鈕要取消active
    collectBtn.addEventListener("click", async function() {
        if (!collectBtn.classList.contains("active")){
            collectBtn.classList.toggle("active");
            postsBtn.classList.remove("active");
            memberM.switchToCollectCTN();
        };

        if (memberM.collectCTN.querySelector(".post-img") === null){
            setTimeout(async () => {
                await mutationCollectObs();
                const collectData = await memberM.getAllCollect(id);
                memberV.genCollectInMember(collectData);
            }, 300);
        };
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