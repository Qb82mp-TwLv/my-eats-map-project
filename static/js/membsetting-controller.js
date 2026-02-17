import settingM from './model/membersetting-m.js';

const memberCenterBtn = document.querySelector(".navbar-btn");
if (memberCenterBtn){
    memberCenterBtn.addEventListener("click", () => {
        settingM.memberCenter();
    });
}

const homePage = document.querySelector(".navbar-title");
if (homePage){
    homePage.addEventListener("click", () => {
        settingM.homePage();
    });
}
