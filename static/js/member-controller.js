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
                        window.location.replace("/");
                    }, 300);
                    
                });
            });
        }

        userId = dt.data.id;
        set_member_info(dt.data);
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
    fansOptionItem(dt.id);

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

let postImageArr = null;
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
                const askEditBtn = document.getElementById("post-edit");
                const askDeleteBtn = document.querySelector(".ask-delete-btn");

                const postId = postB.dataset.postId;
                const postData = await memberM.getPostContent(postId, userId);
                if (postData !== null){
                    memberV.modifyPostInfoInDialog(postData);
                    likeCountNum.dataset.postId=postId;
                    collectCountNum.dataset.postId = postId;
                    askEditBtn.dataset.postId = postId;
                    askDeleteBtn.dataset.postId = postId;
                    // 處理圖片的名稱
                    const imgNameArr = [];
                    postData.img.forEach((item, idx) => {
                        const splitItem = item.split("/");
                        imgNameArr.push(splitItem[3]);
                    });
                    postImageArr = imgNameArr;

                    const postSetting = document.querySelector(".post-option-container");
                    if (userId===postData.user_id){                   
                        postSetting.style.display="flex";
                    }else{
                        postSetting.style.display="none";
                    }
                    memberV.viewSlideOrNot(imgNameArr.length);
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

const postOptionCTNBtn = document.querySelector(".post-option-container");
if (postOptionCTNBtn){
    postOptionCTNBtn.addEventListener("click", () => {
        memberM.postOptionClick();
    });

    document.addEventListener("click", (e) => {
        if (!postOptionCTNBtn.contains(e.target)){
            memberM.postOptionHidden();
        }
    });
}


// 編輯貼文的按鈕
const postEditBtn = document.getElementById("post-edit");
if (postEditBtn){
    postEditBtn.addEventListener("click", function() {
        const postId = postEditBtn.dataset.postId;
        memberM.closePostDialog();
        loaderUI.classList.toggle('active');
        requestAnimationFrame(() => (
            requestAnimationFrame(()=> {
                setTimeout(() => {
                    window.location.replace(`/editpost?post_id=${postId}`);
                }, 300);
            })
        ));
    });
}

// 刪除貼文的按鈕
const postDelBtn = document.getElementById("post-delete");
if (postDelBtn){
    postDelBtn.addEventListener("click", function() {
        memberM.openAskDialog();
    });
};

const postAskDeleteBtn = document.querySelector(".ask-delete-btn");
if (postAskDeleteBtn){
    postAskDeleteBtn.addEventListener("click", async function() {
        // 取得發文的ID
        const postId = postAskDeleteBtn.dataset.postId;
        
        const explainToast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 3000,
        });

        memberM.closeAskDialog();
        memberM.closePostDialog();
        const result = await memberM.askDelPost(postId, userId, postImageArr);
        if (result === null){
            explainToast.fire({
                icon: "error",
                title: "貼文刪除失敗",
                text: "請稍後再進行刪除，謝謝您的配合。",
            });
            return;
        }

        explainToast.fire({
            icon: "success",
            title: "貼文刪除成功",
            text: "成功將此貼文刪除了!",
        });
        setTimeout(() => {
            location.reload();
        }, 3100);
    });
};

const postAskCancelBtn = document.querySelector(".ask-cancel-btn");
if (postAskCancelBtn){
    postAskCancelBtn.addEventListener("click", function() {
        memberM.closeAskDialog();
    });
};

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
        memberM.viewFansInfo();
    });
}

document.addEventListener("click", (e) => {
    if (!fansInfoBtn.contains(e.target)){
        memberM.droplistOptionHidden();
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
            const result = await memberM.setPostFollowBtn(followBtnObj, userId);
            if (result){
                setTrackerNumber(userId);
            }
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
                postFollowBtn(followBtnTag);
            }

            fansInfoOption.appendChild(fansOptionTag);

        }
    }
}

// 取的粉絲資料，並將資料建置於下拉式中
async function fansOptionItem(id) {
    // 先取得粉絲的資訊
    const fansInfo = await memberM.getFansInfo(id, userId);
    if (fansInfo !== null){
        genFansOption(fansInfo);
    }
}


verify_user_token();
setSlideBtn();