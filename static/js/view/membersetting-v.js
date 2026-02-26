class memberSettingView {
    constructor() {
        this.membEmail = document.querySelector(".email-view");
        this.membName = document.querySelector(".name-view");
        this.membNickname = document.querySelector(".nickname-view");
    }

    async fillInMemberInfo(dt) {
        this.membEmail.textContent = String(dt.email);
        this.membName.value = String(dt.name);
        this.membNickname.value = String(dt.nickname);
    }
}

const settingV = new memberSettingView();
export default settingV;