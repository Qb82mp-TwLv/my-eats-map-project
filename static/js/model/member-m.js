class memberModel {
    constructor() {
        this.postCTN = document.getElementById("post-eachone-container");
        this.collectCTN = document.getElementById("collect-eachone-container");
        this.viewSelectHeadshot = document.querySelector(".view-select-headshot");
        this.viewPostContent = document.querySelector(".view-one-post");

        this.imgFile=null;
        this.previewImg = document.querySelector(".preview-img");
        this.user_id=null;

        this.closeSelectHeadshotBtn = document.querySelector(".close-btn");
        if (this.closeSelectHeadshotBtn){
            this.closeSelectHeadshotBtn.addEventListener("click", () => {
                if (this.imgFile !== null){
                    this.previewImg.src = "/static/img/user.png";
                }
                this.viewSelectHeadshot.close();
            });
        }

        this.cancelSelectHeadshotBtn = document.querySelector(".cancel-btn");
        this.cancelSelectHeadshot();

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

        // 展開與收起(編輯或刪除貼文的下拉式功能)
        this.postDropItem = document.querySelector(".post-droplist");
        // 貼文是否要刪除的詢問視窗
        this.viewAskContent = document.querySelector(".delete-ask-window");

        // 顯示粉絲資訊的區塊
        this.fansInfoItem = document.querySelector(".fans-info-droplist");
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
                    window.location.replace("/");
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
                if (this.imgFile !== null){
                    this.previewImg.src = "/static/img/user.png";
                }
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
            if (this.imgFile !== null){
                URL.revokeObjectURL(URL.createObjectURL(this.imgFile));
            }

            this.imgFile = e.target.files[0];

            const imgURL = URL.createObjectURL(this.imgFile);
            this.previewImg.src = imgURL;
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
            // 預覽圖片容器
            const imgInfoCTN = document.querySelector(".food-img-info");
            
            // 當下取得位置
            const posImg = imgInfoCTN.scrollLeft;
            const imgCTNAllWidth = imgInfoCTN.offsetWidth;
            
            imgInfoCTN.scrollTo({
                // 需要使用當下位置扣掉總圖片容器寬度
                left: posImg - imgCTNAllWidth,
                behavior: "smooth"
            });
        });

        this.slideRightBtn.addEventListener("click", () => {
            // 預覽圖片容器
            const imgInfoCTN = document.querySelector(".food-img-info");
            imgInfoCTN.scrollBy({
                left: imgInfoCTN.offsetWidth,
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

            const response = fetch(`/api/post/collectcount`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

        }catch{
            console.log("收藏動作發生錯誤");
        }
    }

    postOptionClick() {
        if (!this.postDropItem.classList.contains('active')){
            this.postDropItem.classList.toggle(`active`);
        }
    }

    postOptionHidden() {
        if (this.postDropItem && this.postDropItem.classList.contains(`active`)){
            this.postDropItem.classList.remove(`active`);
        }
    }

    closeAskDialog() {
        this.viewAskContent.close();
    }

    openAskDialog(){
        if (this.viewAskContent){
            this.viewAskContent.showModal();
        }
    }

    async askDelPost(post_id, user_id, postImageArr) {
        try{
            const formData = new FormData();
            formData.append("post_id", post_id);
            formData.append("user_id", user_id);
            for(let i=0; i<postImageArr.length; i++){
                formData.append("img_list[]", postImageArr[i]);
            }

            const response = await fetch(`/api/post/delete`, {
                method: "DELETE",
                credentials:"include",
                body:formData,
            });

            const data = await response.json();
            if (!response.ok || data.error !== undefined){
                return null;
            }

            return true;
        }catch{
            return null;
        }
    }

    viewFansInfo() {
        if (!this.fansInfoItem.classList.contains('active')){
            this.fansInfoItem.classList.toggle('active');
        }else{
            this.fansInfoItem.classList.remove('active');
        }
    }

    droplistOptionHidden() {
        if (this.fansInfoItem && this.fansInfoItem.classList.contains('active')){
            this.fansInfoItem.classList.remove('active');
        }
    };

    async getFansInfo(userId, userFollowId) {
         try{
            const response = await fetch(`/api/user/fansinfo?user_id=${userId}&user_follow_id=${userFollowId}`,{
                method: "GET",
                credentials: "include",
            });

            const dt = await response.json();
            if (!response.ok || dt.error !== undefined){
                return null;
            }

            return dt.data;
        }catch{
            console.log("取粉絲資訊發生錯誤");
        }
    }

    async setFollowUser(fansUserId, user_id, action) {
        try{
            const formData = new FormData();
            formData.append("post_user_id", fansUserId);
            formData.append("user_id", user_id);
            formData.append("action", action);

            const response = await fetch(`/api/post/follow`,{
                method: "POST",
                credentials: "include",
                body:formData,
            });

            const data = await response.json();

            if(!response.ok || data.error !== undefined){
                return false;
            }

            return true;
        }catch{
            console.log("追蹤動作發生錯誤");
            return false;
        }
    }

    async setPostFollowBtn(followBtnObj, user_id) {
        const fansUserId = followBtnObj.dataset.userId;
        if (followBtnObj.dataset.follow === "no"){
            followBtnObj.textContent = "取消追蹤";
            followBtnObj.dataset.follow = "yes";
            const result = await this.setFollowUser(fansUserId, user_id, "yes");
            return result;
        }else if(followBtnObj.dataset.follow === "yes"){
            followBtnObj.textContent = "追蹤";
            followBtnObj.dataset.follow = "no";
            const result = await this.setFollowUser(fansUserId, user_id, "no");
            return result;
        }; 
    }
}

const memberM = new memberModel();
export default memberM;