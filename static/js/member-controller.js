import memberM from './model/member-m.js';
import memberV from './view/member-v.js';

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
    console.log("大頭照");
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
    postsBtn.addEventListener("click", async () => {
        if (!postsBtn.classList.contains("active")){
            postsBtn.classList.toggle("active");
            collectBtn.classList.remove("active");
            memberM.switchToPostsCTN();
        };

        const postData = await memberM.getAllPosts(id);
        memberV.genPostsInMember(postData);
    });

    // 收藏按鈕要使用active
    // 並隱藏post的部分，與按鈕要取消active
    collectBtn.addEventListener("click", async () => {
        if (!collectBtn.classList.contains("active")){
            collectBtn.classList.toggle("active");
            postsBtn.classList.remove("active");
            memberM.switchToCollectCTN();
        };

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
        if (postImgBtn[i]){
            postImgBtn[i].addEventListener("click", async () => {
                memberM.openPostDialog();
                //const postId = postImgBtn.dataset.collectId;
                // const postData = await memberM.getPostContent(postId);
                // if (postData !== null){
                //     memberV.modifyPostInfoInDialog(postData);
                // }
            });
        };

        i++;
    }
    
}


verify_user_token();
postEachOneClick();