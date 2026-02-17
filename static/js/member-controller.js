import memberM from './model/member-m.js';

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