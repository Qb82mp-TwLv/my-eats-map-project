class memberModel {
    constructor() {

    }

    async settingMemberInfo() {
        window.location.href = "/setting";
    }

    async homePage() {
        window.location.href = "/eatsmap";
    }

}

const memberM = new memberModel();
export default memberM;