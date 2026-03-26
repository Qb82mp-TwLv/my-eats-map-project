class loginModel {
    constructor() {
        //登入與註冊的切換按鈕
        this.signInBtn = document.querySelector(".signin-top-btn");
        this.logInBtn = document.querySelector(".login-top-btn");

        this.loginUIObj = document.getElementById("login-block");
        this.siginUIObj = document.getElementById("signin-block"); 
        // 登入使用的輸入
        this.loginEmail = document.querySelector(".login-email");
        this.loginPw = document.querySelector(".login-pw");
        //註冊輸入的欄位
        this.signinName = document.querySelector(".signin-name");
        this.signinEmail = document.querySelector(".signin-email");
        this.signinPw = document.querySelector(".signin-pw");
        this.signinNickname = document.querySelector(".signin-nickname");
        // 登入或註冊出現錯誤，使用顯示文字的物件
        this.errorLoginText = document.querySelector(".error-login-text");
        this.errorSigninText = document.querySelector(".error-signin-text");

        this.loaderUI = document.querySelector(".loading-container");
    }

    async switchToSignin() {
        // 切換介面
        this.loginUIObj.className = "login-second-hidden";
        this.siginUIObj.className = "sign-second-container";
        this.errorLoginTextHidden();
        // 按鈕切換
        if (!this.signInBtn.classList.contains('active')){
            this.signInBtn.classList.toggle('active');
            this.logInBtn.classList.remove('active');
        }
    }

    async switchToLoginin() {
        // 切換介面
        this.loginUIObj.className = "login-second-container";
        this.siginUIObj.className = "sign-second-hidden";
        this.errorSigninTextHidden();
        // 按鈕切換
        if (!this.logInBtn.classList.contains('active')){
            this.logInBtn.classList.toggle('active');
            this.signInBtn.classList.remove('active');
        }
    }

    async errorLoginTextView(text) {
        this.errorLoginText.style.display = "block";
        this.errorLoginText.textContent= text;
    }

    async errorLoginTextHidden() {
        this.errorLoginText.style.display = "none";
    }

    async loginSubmit() {
        if (this.loginEmail !== undefined && this.loginPw !== undefined){
            const email = this.loginEmail.value.trim();
            const pw = this.loginPw.value.trim();

            if (email !== "" && pw !== ""){
                //驗證信箱格式
                if ((/^[A-Za-z]+[A-Za-z0-9]+((\_|\.)[A-Za-z0-9]+)*\@[A-Za-z0-9]+(\.[A-Za-z]+)+$/.test(email)) === false || (email.length > 254)){
                    this.errorLoginTextView("電子信箱格式有錯誤");
                    return;
                }

                //驗證密碼長度
                if (pw.length > 100){
                    this.errorLoginTextView("密碼長度過長");
                    return;
                }

                const jsonLogin = {
                    "email": email,
                    "password": pw
                }

                try{
                    const response = await fetch("/api/user/auth", {
                        method: "PUT",
                        credentials: "include",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(jsonLogin)
                    });

                    const data = await response.json();
                    
                    if (!response.ok || data.error !== undefined){
                        this.errorLoginTextView("電子信箱或密碼有錯誤");
                    }else{
                        this.errorLoginTextHidden();
                        location.reload();
                    }
                }catch(error){
                    this.errorLoginTextView("電子信箱或密碼有錯誤");
                }
            }else{
                this.errorLoginTextView("請確認電子信箱與密碼都已填寫");
            }
        }
    };

    async errorSigninTextView(text) {
        this.errorSigninText.style.display = "block";
        this.errorSigninText.textContent= text;
    }

    async errorSigninTextHidden() {
        this.errorSigninText.style.display = "none";
    }

    async signinSubmit() {
        if (this.signinName && this.signinEmail && this.signinPw && this.signinNickname){
            const name = this.signinName.value.trim();
            const email = this.signinEmail.value.trim();
            const pw = this.signinPw.value.trim();
            const nickname = this.signinNickname.value.trim();

            if (name !== "" && email !== "" && pw !== ""){
                //驗證名字長度
                if (name.length > 100){
                    this.errorSigninTextView("輸入的姓名長度過長，請重新輸入");
                    return;
                }

                //驗證信箱格式
                if ((/^[A-Za-z]+[A-Za-z0-9]+((\_|\.)[A-Za-z0-9]+)*\@[A-Za-z0-9]+(\.[A-Za-z]+)+$/.test(email)) === false || (email.length > 254)){
                    this.errorSigninTextView("電子信箱格式有錯誤");
                    return;
                }

                //驗證密碼長度
                if (pw.length > 100){
                    this.errorSigninTextView("密碼長度過長");
                    return;
                }

                if (nickname.length > 30){
                    this.errorSigninTextView("暱稱的字過長");
                    return;
                }

                const jsonSignin = {
                    "name": name,
                    "email": email,
                    "password": pw,
                    "nickname": nickname
                }

                try{
                    const response = await fetch("/api/user", {
                        method: "POST",
                        credentials: "include",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(jsonSignin)
                    });

                    const data = await response.json();

                    if (data.ok !== undefined){
                        this.signinName.value="";
                        this.signinEmail.value="";
                        this.signinPw.value="";
                        this.signinNickname.value="";
                        this.errorSigninTextView("註冊成功，現在可以登入了");
                    }else{
                        this.errorSigninTextView("電子信箱重複註冊，或發生其他錯誤");
                    }

                }catch(error){
                    this.errorSigninTextView("註冊過程中發生錯誤");
                }
            }else{
                this.errorSigninTextView("請確認姓名、電子信箱與密碼都已輸入");
            }
        }
    };
}

const loginM = new loginModel();
export default loginM;