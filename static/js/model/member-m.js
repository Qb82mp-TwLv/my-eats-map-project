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

        // 滑動圖片的按鈕
        this.slideLeftBtn = document.getElementById("slideLeft");
        this.slideRightBtn = document.getElementById("slideRight");
        // 觀看圖片的容器
        this.imgInfoCTN = document.querySelector(".food-img-info");

        // loading頁面
        this.loaderUI = document.querySelector(".loading-container");
    }

    async settingMemberInfo() {
        this.loaderUI.classList.toggle(`active`);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/setting");
                }, 300);
                
            });
        });
    }

    async homePage() {
        this.loaderUI.classList.toggle(`active`);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.location.replace("/eatsmap");
                }, 300);
                
            });
        });
    }


    async get_tracker_number(id) {
        try{
            const response = await fetch(`/api/user/follow?user_id=${id}`, {
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
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
        try{
            const response = await fetch(`/api/user/fans?user_id=${id}`, {
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 100));
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
        try{
            const response = await fetch(`/api/user/posts?user_id=${id}`, {
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (dt.data !== undefined){
                if (dt.data.post_id !== undefined){
                    return dt.data;
                }
            }

            return null;
        }catch(error) {
            console.log("取發文的貼文資料發生錯誤");
        }
    };

    async getAllCollect(id) {
        try{
            const response = await fetch(`/api/user/collect?user_id=${id}`, {
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (dt.data !== undefined){
                if (dt.data.post_id !== undefined){
                    return dt.data;
                }
            }

            return null;
        }catch(error) {
            console.log("取收藏的貼文資料發生錯誤");
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

    async submitHeadshotImg(imgNM) {
        if (this.imgFile !== null){
            const formData = new FormData();
            formData.append("user_id", this.user_id);
            formData.append("headshot", imgNM);
            formData.append("image", this.imgFile); 
            try{
                const response = await fetch("/api/user/headshot",{
                    method: "POST",
                    credentials: "include",
                    body:formData,
                });

                const dt = await response.json();
                
                await new Promise(delay => setTimeout(delay, 100));
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

    async changeImg() {
        const fileUpload = document.getElementById("image-upload");
        fileUpload.addEventListener("change", (e) => {
            this.imgFile = e.target.files[0];

            this.previewImg.src = URL.createObjectURL(this.imgFile);
        });
    };

    async getHeadshotUrl(imgNM) {
        try{
            const response = await fetch(`/api/user/headshoturl?headshot_name=${imgNM}`,{
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                return null;
            }

            return dt.data.img;

        }catch{
            return null;
        }
    }

    async getPostContent(post_id, id) {
        // 取得post的資料
        try{
            const response = await fetch(`/api/post/single?post_id=${post_id}&user_id=${id}`,{
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();

            await new Promise(delay => setTimeout(delay, 200));
            if (!response.ok || dt.error !== undefined){
                console.log("取發文內容發生錯誤");
                return null;
            }

            return dt.data;

        }catch(error){
            console.log("取發文內容發生錯誤");
            return null;
        }
    };

    async slideBtnClick() {
        this.slideLeftBtn.addEventListener("click", () => {
            this.imgInfoCTN.scrollTo({
                left: -this.imgInfoCTN.offsetWidth,
                behavior: "smooth"
            });
        });

        this.slideRightBtn.addEventListener("click", () => {
            this.imgInfoCTN.scrollTo({
                left: this.imgInfoCTN.offsetWidth,
                behavior: "smooth"
            });
        });
    }

    async likeCountSubmit(user_id, post_id, action) {
        try{
            const formData = new FormData();
            formData.append("user_id", user_id);
            formData.append("post_id", post_id);
            formData.append("action", action);

            // const response = await 
            const response = fetch(`/api/post/likecount`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

        }catch{
            console.log("按讚動作發生錯誤");
        }
    }

    async collectCountSubmit(user_id, post_id, action) {
        try{
            const formData = new FormData();
            formData.append("user_id", user_id);
            formData.append("post_id", post_id);
            formData.append("action", action);

            // const response = await 
            const response = fetch(`/api/post/collectcount`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

        }catch{
            console.log("收藏動作發生錯誤");
        }
    }
}

const memberM = new memberModel();
export default memberM;