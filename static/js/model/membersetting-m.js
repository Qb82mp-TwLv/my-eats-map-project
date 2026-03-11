class memberSettingModel {
    constructor() {
        this.memberName = document.querySelector(".name-view");
        this.memberNickname = document.querySelector(".nickname-view");

        // loading
        this.loaderUI = document.querySelector(".loading-container");
    }

    async memberCenter() {
        this.loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/member");
                }, 300);
                
            });
        });
    }

    async homePage() {
        this.loaderUI.classList.toggle('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/eatsmap");
                }, 300);
                
            });
        });
    }

    async logOutSubmit() {
        this.loaderUI.classList.toggle('active');
        const response = await fetch(`/api/user/logout`, {
            method: "POST",
            credentials: "include",
        });

        sessionStorage.clear();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/login");
                }, 300);
                
            });
        });
    }

    async updateMemberInfo(id) {
        const name = this.memberName.value.trim();
        const nickname = this.memberNickname.value.trim();
        if (name !== ""){
            if (name.length > 100){
                return "輸入的名稱不能超過100個字";
            }

            if (nickname.length > 30){
                return "輸入的暱稱不能超過30個字";
            }

            const jsonInfo = {
                "id": id,
                "name": name,
                "nickname": nickname
            }

            try{
                const response = await fetch("/api/user/infoupdate", {
                    method: "PATCH",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(jsonInfo)
                });

                const data = await response.json();

                if (data.ok !== undefined){
                    return "更新個人資料成功，請重新登入，謝謝。"
                }
                    
                return "更新過程中發生錯誤，請稍後再更新。";

            }catch(error){
                return "更新過程中發生錯誤，請稍後再更新。";
            }
        }   
    };

    async updateMemberPw(id) {
        const oldPwInout = document.querySelector(".old-pw");
        const newPwInput = document.querySelector(".new-pw");
        const oldPw = oldPwInout.value.trim();
        const newPw = newPwInput.value.trim();

        if (oldPw !== "" && newPw !== ""){
            if (oldPw.length > 100){
                return "原密碼有錯誤，密碼長度過長，請修正。";
            }

            if (newPw.length > 100){
                return "新密碼的長度過長，請重新輸入。";
            }

            const jsonInfo = {
                "id": id,
                "oldpassword": oldPw,
                "newpassword": newPw
            }

            try{
                const response = await fetch("/api/uer/updatepw", {
                    method: "PATCH",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(jsonInfo)
                });

                const data = await response.json();

                if (data.ok !== undefined){
                    oldPwInout.value="";
                    newPwInput.value="";
                    return "更新密碼成功，請重新登入，謝謝。";
                }                   
                return "更新密碼過程中發生錯誤，請稍後再更新。";

            }catch(error){
                return "更新密碼過程中發生錯誤，請稍後再更新。";
            }
        };
    };
}

const settingM = new memberSettingModel();
export default settingM;