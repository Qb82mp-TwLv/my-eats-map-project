class memberModel {
    constructor() {
        this.postCTN = document.getElementById("post-eachone-container");
        this.collectCTN = document.getElementById("collect-eachone-container");
        this.viewSelectHeadshot = document.querySelector(".view-select-headshot");
        this.viewPostContent = document.querySelector(".view-one-post");
        this.closeSelectHeadshotBtn = document.querySelector(".close-btn");
        if (this.closeSelectHeadshotBtn){
            this.closeSelectHeadshotBtn.addEventListener("click", () => {
                this.viewSelectHeadshot.close();
            });
        }

        this.cancelSelectHeadshotBtn = document.querySelector(".cancel-btn");
        this.cancelSelectHeadshot();

        this.imgFile=null;
        this.previewImg = document.querySelector(".preview-img");
        this.user_id=null;

        // 貼文的dialog
        this.closePostDialogBtn = document.querySelector(".close-post-btn");
        if (this.closePostDialogBtn){
            this.closePostDialogBtn.addEventListener("click", () => {
                this.closePostDialog();
            });
        }
    }

    async settingMemberInfo() {
        window.location.href = "/setting";
    }

    async homePage() {
        window.location.href = "/eatsmap";
    }

    async postAPost() {
        window.location.href = "/postcomment";
    }

    async get_tracker_number(id) {
        const token = localStorage.getItem("token");
        try{
            const response = await fetch(`/api/user/follow?user_id=${id}`, {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`}
            });

            const dt = await response.json();

            if (dt.data !== undefined){
                const trackerCount = dt.data.count;
                return String(trackerCount);
            }

            return "0";
        }catch(error) {
            console.log("取追蹤人數出現錯誤");
            return "0";
        }
    };

    async get_fans_number(id) {
        const token = localStorage.getItem("token");
        try{
            const response = await fetch(`/api/user/fans?user_id=${id}`, {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`}
            });

            const dt = await response.json();

            if (dt.data !== undefined){
                const fansCount = dt.data.count;
                return String(fansCount);
            }

            return "0";
        }catch(error) {
            console.log("取粉絲人數出現錯誤");
            return "0";
        }
    };

    async switchToPostsCTN() {
        this.postCTN.className = "posts-content-container";
        this.collectCTN.className = "collect-content-hidden";
    };

    async switchToCollectCTN() {
        this.collectCTN.className = "collect-content-container";
        this.postCTN.className = "posts-content-hidden";
    };

    async getAllPosts(id) {
        const token = localStorage.getItem("token");
        if (token !== null){
            try{
                const response = await fetch(`/api/user/posts?user_id=${id}`, {
                    method: "GET",
                    headers: {"Authorization": `Bearer ${token}`}
                });

                const dt = await response.json();

                if (dt.data !== undefined){
                    if (dt.data.post_id !== undefined){
                        return dt.data;
                    }
                }

                return null;
            }catch(error) {
                console.log("取發文的貼文資料發生錯誤");
            }
        }
    };

    async getAllCollect(id) {
        const token = localStorage.getItem("token");
        if (token !== null){
            try{
                const response = await fetch(`/api/user/collect?user_id=${id}`, {
                    method: "GET"
                });

                const dt = await response.json();

                if (dt.data !== undefined){
                    if (dt.data.post_id !== undefined){
                        return dt.data;
                    }
                }

                return null;
            }catch(error) {
                console.log("取收藏的貼文資料發生錯誤");
            }
        }
    };

    async openSelectHeadshot(id){
        if (this.viewSelectHeadshot){
            this.viewSelectHeadshot.showModal();
        }

        this.user_id = id;
    }

    async closeSelectHeadshot() {
        this.viewSelectHeadshot.close();
    }

    async cancelSelectHeadshot() {
        if (this.cancelSelectHeadshotBtn){
            this.cancelSelectHeadshotBtn.addEventListener("click", () => {
                this.closeSelectHeadshot();
            });
        }
    }

    async closePostDialog() {
        this.viewPostContent.close();
    }

    async openPostDialog(){
        if (this.viewPostContent){
            this.viewPostContent.showModal();
        }
    }

    async changeImg() {
        const fileUpload = document.getElementById("image-upload");
        fileUpload.addEventListener("change", (e) => {
            this.imgFile = e.target.files[0];

            this.previewImg.src = URL.createObjectURL(this.imgFile);
        });
    };

    async submitHeadshotImg(imgNM) {
        const token = localStorage.getItem("token");
        if (this.imgFile !== null){
            const formData = new FormData();
            formData.append("user_id", this.user_id);
            formData.append("headshot", imgNM);
            formData.append("image", this.imgFile); 
            console.log(imgNM);
            try{
                const response = await fetch("/api/user/headshot",{
                    method: "POST",
                    headers:{"Authorization": `Bearer ${token}`},
                    body:formData,
                });

                const dt = await response.json();
                console.log(dt);
                if (!response.ok || dt.error !== undefined){
                    console.log("大頭照更新失敗");
                    return null;
                }else{
                    this.previewImg.onload = () => {
                        URL.revokeObjectURL(this.src); 
                    };
                    const url = dt.data.img;
                    return url;
                };

            }catch{
                console.log("大頭照更新失敗");
            }

            return null;
        }

        return null;
    }

    async getHeadshotUrl(imgNM) {
        try{
            const response = await fetch(`/api/user/headshoturl?headshot_name=${imgNM}`,{
                method: "GET",
            });

            const dt = await response.json();

            if (!response.ok || dt.error !== undefined){
                return null;
            }

            return dt.data.img;

        }catch{
            return null;
        }
    }

    async getPostContent(post_id) {
        // 取得post的資料
        const token = localStorage.getItem("token");
        try{
            const response = await fetch(`/api/post/single?post_id=${post_id}`,{
                method: "GET",
                headers:{"Authorization": `Bearer ${token}`},
            });

            const dt = await response.json();

            if (!response.ok || dt.error !== undefined){
                console.log("取發文內容發生錯誤");
                return null;
            }

            return dt.data;

        }catch{
            console.log("取發文內容發生錯誤");
            return null;
        }
    };
}

const memberM = new memberModel();
export default memberM;