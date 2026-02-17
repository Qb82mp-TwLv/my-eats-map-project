class memberSettingModel {
    constructor() {

    }

    async memberCenter() {
        window.location.href = "/member";
    }

    async homePage() {
        window.location.href = "/eatsmap";
    }

}

const settingM = new memberSettingModel();
export default settingM;