import loginM from "./model/login-m.js";


// 切換至註冊
const signinBtn = document.querySelector(".signin-top-btn");
if (signinBtn){
    signinBtn.addEventListener("click", () => {
        loginM.switchToSignin();
    });
}

const loginBtn = document.querySelector(".login-top-btn");
if (loginBtn){
    loginBtn.addEventListener("click", () => {
        loginM.switchToLoginin();
    });
}

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