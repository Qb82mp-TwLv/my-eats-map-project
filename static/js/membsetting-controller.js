import settingM from './model/membersetting-m.js';
import settingV from './view/membersetting-v.js';

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

        memberInfo(dt.data);
        saveUserUpdate(dt.data.id)
        updatePw(dt.data.id);
    }catch(error){
        window.location.href = "/login";
    }
};

async function memberInfo(dt){
    settingV.fillInMemberInfo(dt);
} 

async function saveUserUpdate(id) {
    const updateUserInfoBtn = document.querySelector(".save-user-info");
    if (updateUserInfoBtn){
        updateUserInfoBtn.addEventListener("click", async () => {
            if (confirm("請確認是否要更新使用者資訊，謝謝您。")){
                const result = await settingM.updateMemberInfo(id);
                alert(String(result));
            }
        });
    }
}

async function updatePw(id) {
    const updateUserPwBtn = document.querySelector(".update-pw-btn");
    if (updateUserPwBtn){
        updateUserPwBtn.addEventListener("click", async () => {
            if (confirm("請確認是否要更新密碼，謝謝您。")){
                const result = await settingM.updateMemberPw(id);
                alert(String(result));
            }
        });
    }
}

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

const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn){
    logoutBtn.addEventListener("click", () => {
        settingM.logOutSubmit();
    });
}

verify_user_token();