class memberView {
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
        console.log(name);
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
                collectItemTag.dataset.collectId=collectIdArr[i];
                const collectImgTag = document.createElement("img");
                collectImgTag.src = imgArr[i];

                collectItemTag.appendChild(collectImgTag);
                this.collectCTN.appendChild(collectItemTag);
            }
        }
    }

    modifyPostInfoInDialog(dt) {
        // 清除之前的內容
        // while (this.imgCTN.firstChild){
        //     this.imgCTN.removeChild(this.imgCTN.firstChild);
        // }

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
            infoContainerTag.classList.add("info-container");
            const imgNameTag = document.createElement("div");
            imgNameTag.classList.add("img-name");
            const imgPriceTag = document.createElement("div");
            imgPriceTag.classList.add("img-price");
            infoContainerTag.appendChild(imgNameTag);
            infoContainerTag.appendChild(imgPriceTag);
            foodInfoTag.appendChild(infoContainerTag);

        }
        
        console.log(dt);

        if (dt.headshot !== ""){
            this.postHeadshot.src = dt.headshot;
        }
        this.postName.textContent = String(dt.name);
        this.postExperience.textContent = String(dt.comment);
        this.postArea.textContent = String(dt.environment);
        this.postLikeCount.textContent = String(dt.like_count);
        this.postCollectCount.textContent = String(dt.collect_count);
    }
}

const memberV = new memberView();
export default memberV;