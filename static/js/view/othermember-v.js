class othermemberView {
    constructor() {
        this.postsCTN = document.getElementById("post-eachone-container");
        this.collectCTN = document.getElementById("collect-eachone-container");

        // 將撈取的資料回填至貼文
        this.imgCTN = document.querySelector(".food-img-info");
        this.postHeadshot = document.querySelector(".post-user-headshot");
        this.postName = document.querySelector(".user-nickname");
        this.postExperience = document.querySelector(".experience-text");
        this.postArea = document.querySelector(".area-text");
        this.postLikeCount = document.querySelector(".like-count");
        this.postCollectCount = document.querySelector(".collect-count");
        this.storeName = document.querySelector(".store-name");
        
        // 取得post有幾則
        this.postCount=0;
        this.collectCount = 0;

        // 控制按讚按鈕與收藏按鈕
        this.loveBtn = document.getElementById("like-btn");
        this.favoriteBtn = document.getElementById("favorite-btn");
    }

    settingHeadshot(img) {
        const headshot_obj = document.querySelector(".headshot-item-img");
        switch (img){
            case null:
                headshot_obj.src = "/static/img/user.png";
                break;
            default:
                headshot_obj.src = img;
        }  
    }

    settingName(name) {
        const nameText = document.querySelector(".name-view");
        nameText.textContent = String(name);
    }

    genPostsInMember(dt) {
        const postImg = this.postsCTN.querySelectorAll(".post-img");
        if (postImg.length !== 0){
            postImg.forEach(item => {
                item.remove();
            });
        }
        if (dt !== null){
            const postIdArr = dt.post_id;
            const imgArr = dt.image;
            for(let i=0; i<postIdArr.length; i++){
                const postItemTag = document.createElement("div");
                postItemTag.classList.add("post-img");
                postItemTag.dataset.postId=postIdArr[i];
                const postImgTag = document.createElement("img");
                postImgTag.src = imgArr[i];

                postItemTag.appendChild(postImgTag);
                this.postsCTN.appendChild(postItemTag);
            }

            this.postCount = postIdArr.length;
        }
    }

    genCollectInMember(dt) {
        const collectImg = this.collectCTN.querySelectorAll(".post-img");
        if (collectImg.length !== 0){
            collectImg.forEach(item => {
                item.remove();
            });
        }

        if (dt !== null){
            const collectIdArr = dt.post_id;
            const imgArr = dt.image;
            for(let i=0; i<collectIdArr.length; i++){
                const collectItemTag = document.createElement("div");
                collectItemTag.classList.add("post-img");
                collectItemTag.dataset.postId=collectIdArr[i];
                const collectImgTag = document.createElement("img");
                collectImgTag.src = imgArr[i];

                collectItemTag.appendChild(collectImgTag);
                this.collectCTN.appendChild(collectItemTag);
            }
            this.collectCount = collectIdArr.length;
        }
    }

    modifyPostInfoInDialog(dt) {
        // 清除之前的內容
        while (this.imgCTN.firstChild){
            this.imgCTN.removeChild(this.imgCTN.firstChild);
        }

        if (dt.img.length > 1){
            // 滑動的按鈕容器
            const slideCTN = document.querySelector(".sildeBtn");
            slideCTN.style.display = "flex";
        }

        // 建立圖片的內容
        for (let i=0; i<dt.img.length; i++){
            const imgscrollTag = document.createElement("div");
            imgscrollTag.classList.add("img-info-scroll");

            const imgSlidesTag = document.createElement("div");
            imgSlidesTag.classList.add("imgSlides");
            imgSlidesTag.id="imgItem";
            const imgContainerTag = document.createElement("div");
            imgContainerTag.classList.add("img-container");
            const imgTag = document.createElement("img");
            imgTag.src=dt.img[i];
            imgContainerTag.appendChild(imgTag);
            imgSlidesTag.appendChild(imgContainerTag);

            const foodInfoTag = document.createElement("div");
            foodInfoTag.classList.add("food-info");
            const infoContainerTag = document.createElement("div");
            infoContainerTag.classList.add("food-info-container");
            const imgNameTag = document.createElement("div");
            imgNameTag.classList.add("img-name");
            imgNameTag.textContent = String(dt.food_name[i]);
            const imgPriceTag = document.createElement("div");
            imgPriceTag.classList.add("img-price");
            imgPriceTag.textContent = String(dt.food_price[i])+"元";
            infoContainerTag.appendChild(imgNameTag);
            infoContainerTag.appendChild(imgPriceTag);
            foodInfoTag.appendChild(infoContainerTag);

            imgscrollTag.appendChild(imgSlidesTag);
            imgscrollTag.appendChild(foodInfoTag);

            this.imgCTN.appendChild(imgscrollTag);
        }

        if (dt.headshot !== ""){
            this.postHeadshot.src = dt.headshot;
        }else{
            this.postHeadshot.src= "/static/img/user.png";
        }
        this.postHeadshot.dataset.userId = dt.user_id;
        this.postName.textContent = String(dt.name);
        this.postExperience.textContent = String(dt.comment);
        this.postArea.textContent = String(dt.environment);
        this.postLikeCount.textContent = String(dt.like_count);
        this.postCollectCount.textContent = String(dt.collect_count);
        this.storeName.textContent = String(dt.store_name);

        const foodImgInfoCTN = document.querySelector(".food-img-info");
        // 滑到最左邊
        foodImgInfoCTN.scrollTo({
            left: 0,
            behavior: 'smooth' 
        });

        this.setLoveBtnAndCollectBtn(dt.liked, dt.collected);
    };

    async setLoveBtnAndCollectBtn(liked, collected) {
        if (liked === "yes"){
            this.loveBtn.src="/static/img/heart-color.png";
            this.loveBtn.dataset.like="yes";
        }else{
            this.loveBtn.src = "/static/img/heart-nocolor.png";
            this.loveBtn.dataset.like="no";
        };

        if (collected === "yes"){
            this.favoriteBtn.src="/static/img/bookmark-color.png";
            this.favoriteBtn.dataset.collect="yes";
        }else{
            this.favoriteBtn.src="/static/img/bookmark-nocolor.png";
            this.favoriteBtn.dataset.collect="no";
        };
    };

    async viewSlideOrNot(imgLength) {
        if (imgLength === 1){
            // 滑動的按鈕容器
            const slideCTN = document.querySelector(".sildeBtn");
            slideCTN.style.display = "none";
        }
    }
}



const othermemberV = new othermemberView();
export default othermemberV;