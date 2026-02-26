class postCommentView {
    constructor() {
        this.countryOption = document.querySelector(".country-option");
        this.cityOption = document.querySelector(".city-option");
        this.typeOption = document.querySelector(".type-option");
        // 預覽圖片
        this.previewImgCTN = document.querySelector(".preview-img-slide");
        // 填寫食物名稱與價格
        this.foodBlockCTN = document.querySelector(".food-block");
    }

    countryDropList(country) {     
        const optionTag = document.createElement("li");
        optionTag.classList.add("option");
        optionTag.textContent = String(country);

        this.countryOption.appendChild(optionTag);
        return optionTag;
    };

    cityDropList(city) {
        const optionTag = document.createElement("li");
        optionTag.classList.add("option");
        optionTag.textContent = String(city);

        this.cityOption.appendChild(optionTag);
        return optionTag;
    };

    typesDropList(types) {
        const optionTag = document.createElement("li");
        optionTag.classList.add("option");
        optionTag.textContent = String(types);

        this.typeOption.appendChild(optionTag);
        return optionTag;
    };

    async deletePreviewImgTag() {
        // 先判斷是否有其他值
        if (document.querySelector(".imgSlides") !== null){
            while (this.previewImgCTN.firstChild){
                this.previewImgCTN.removeChild(this.previewImgCTN.firstChild);
            };
        }
    }

    async createPriviewImg(img) {
        // 確認檔案是否為圖片格式
        if (img.type.startsWith("image/")){
            const imgSlideTag = document.createElement("div");
            imgSlideTag.classList.add("imgSlides");
            imgSlideTag.id = "imgItem";
            const viewImgTag = document.createElement("img");
            viewImgTag.src= URL.createObjectURL(img);

            imgSlideTag.appendChild(viewImgTag);
            this.previewImgCTN.appendChild(imgSlideTag);

            viewImgTag.onload = () => {
                URL.revokeObjectURL(this.src);
            };
        };           
    };

    async addFoodNameAndPriceInput() {
        const foodContentCTNTag = document.createElement("div");
        foodContentCTNTag.classList.add("food-content-container");
        
        const foodNameTag = document.createElement("div");
        foodNameTag.classList.add("food-name");
        const nameTitleTag = document.createElement("div");
        nameTitleTag.classList.add("name-title");
        nameTitleTag.textContent= "名稱";
        const nameTextTag = document.createElement("input");
        nameTextTag.type = "text";
        nameTextTag.name = "nametext";
        nameTextTag.classList.add("name-text");
        nameTextTag.maxLength = 80;
        foodNameTag.appendChild(nameTitleTag);
        foodNameTag.appendChild(nameTextTag);

        const foodPriceTag = document.createElement("div");
        foodPriceTag.classList.add("food-price");
        const priceTitleTag = document.createElement("div");
        priceTitleTag.classList.add("price-title");
        priceTitleTag.textContent = "價格";
        const priceTextTag = document.createElement("input");
        priceTextTag.type = "text";
        priceTextTag.name= "pricetext";
        priceTextTag.classList.add("price-text");
        foodPriceTag.appendChild(priceTitleTag);
        foodPriceTag.appendChild(priceTextTag);

        foodContentCTNTag.appendChild(foodNameTag);
        foodContentCTNTag.appendChild(foodPriceTag);

        this.foodBlockCTN.appendChild(foodContentCTNTag);
    }
};

const postCommentV = new postCommentView();
export default postCommentV;