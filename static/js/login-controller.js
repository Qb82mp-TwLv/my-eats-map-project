import loginM from "./model/login-m.js";

async function verify_user_token() {
    const token = localStorage.getItem("token");
    if (token !== null){
        try{
            const response = await fetch("/api/user/auth", {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`}
            });

            const dt = await response.json();
            if (dt.data !== null){
                window.location.href = "/eatsmap";
            }
        }catch(error){
            console.log("請先登入");
        }
    }
};

verify_user_token();

// 切換登入與註冊
const switchLogBtn = document.querySelector(".login-signin-btn");
if (switchLogBtn){
    switchLogBtn.addEventListener("click", () => {
        const loginSigninText = {
            "註冊": () => {
                switchLogBtn.textContent = "登入";
                loginM.switchToSignin();
            },
            "登入": () => {
                switchLogBtn.textContent = "註冊";
                loginM.switchToLoginin();
            }
        };

        const switchLogBtnText = switchLogBtn.textContent;
        if (loginSigninText[switchLogBtnText]){
            loginSigninText[switchLogBtnText]();
        }else{
            console.log("找不到對應的執行動作");
        }
        
    });
};

const loginSubmitBtn = document.querySelector(".login-btn");
if (loginSubmitBtn){
    loginSubmitBtn.addEventListener("click", () => {
        loginM.loginSubmit();
    });
}

const signinSubmitBtn = document.querySelector(".signin-btn");
if (signinSubmitBtn){
    signinSubmitBtn.addEventListener("click", () => {
        loginM.signinSubmit();
    })
}