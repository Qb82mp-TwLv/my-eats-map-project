class editPostView {
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

    async createPriviewImg(dt) {      
        // 建立圖片
        const imgArr = dt.img;
        for (let i=0; i<imgArr.length; i++){
            const imgSlideTag = document.createElement("div");
            imgSlideTag.classList.add("imgSlides");
            imgSlideTag.id = "imgItem";
            imgSlideTag.dataset.imgIdx = String(i);
            const viewImgTag = document.createElement("img");
            viewImgTag.src= imgArr[i];

            // 輸入文字部分
            const inputFormTag = document.createElement("form");
            inputFormTag.classList.add("food-block");
            const foodContentCTNTag = document.createElement("div");
            foodContentCTNTag.classList.add("food-content-container");
            const foodNameInputTag = document.createElement("input");
            foodNameInputTag.type="text";
            foodNameInputTag.name="nametext";
            foodNameInputTag.classList.add("name-text");
            foodNameInputTag.maxLength = "80";
            foodNameInputTag.placeholder = "餐點名稱，例如:提拉米蘇";
            foodNameInputTag.value = String(dt.food_name[i]);
            const foodPriceInputTag = document.createElement("input");
            foodPriceInputTag.type="text";
            foodPriceInputTag.name="pricetext";
            foodPriceInputTag.classList.add("price-text");
            foodPriceInputTag.placeholder = "餐點價格，例如:540";
            foodPriceInputTag.value = String(dt.food_price[i]);
            foodContentCTNTag.appendChild(foodNameInputTag);
            foodContentCTNTag.appendChild(foodPriceInputTag);
            inputFormTag.appendChild(foodContentCTNTag);

            // 圖片刪除的按鈕
            if (imgArr.length > 1){
                const delImg = document.createElement("button");
                delImg.classList.add("del-img-btn");
                delImg.dataset.imgIdx = String(i);
                imgSlideTag.appendChild(delImg);
            }

            imgSlideTag.appendChild(viewImgTag);
            imgSlideTag.appendChild(inputFormTag);
            this.previewImgCTN.appendChild(imgSlideTag);
        };

        if (imgArr.length > 1){
            // 滑動的按鈕容器
            const slideCTN = document.querySelector(".sildeBtn");
            slideCTN.style.display = "flex";
        }

        // 將地址顯示在"店家資訊"
        const storeAddressAndName = document.querySelector(".name-address-text");
        storeAddressAndName.textContent=`店家資訊：${String(dt.name)}；${String(dt.address)}`;

        // 將選擇的選項顯示於下拉式
        // 顯示選擇的文字
        const countrySelect = document.querySelector(".country-select");
        const citySelect = document.querySelector(".city-select");
        const typesSelect = document.querySelector(".type-select");
        countrySelect.textContent = String(dt.country);
        citySelect.textContent = String(dt.city);
        typesSelect.textContent = String(dt.type);
        // 將評論顯示
        const commentInfo = document.querySelector(".comment-info");
        commentInfo.value = String(dt.comment);
        const diningInfo = document.querySelector(".dining-area-info");
        diningInfo.value = String(dt.environment);
    };

    updatePreviewImgCTN () {
        this.previewImgCTN = document.querySelector(".preview-img-slide");
    }
};

const editPostV = new editPostView();
export default editPostV;