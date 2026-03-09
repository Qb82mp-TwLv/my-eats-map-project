class indexView {
    constructor() {
        this.countryOption = document.querySelector(".country-option");
        this.cityOption = document.querySelector(".city-option");
        this.typeOption = document.querySelector(".types-option");
        this.followOption = document.querySelector(".tracker-option");
    }

    async marker(map, position, img) {
    // 只有在執行到這行時，才會向 Google 請求載入 marker 函式庫
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        const bgMarker = document.createElement("button");
        bgMarker.classList.add("marker-btn");
        const beachFlagImg = document.createElement("img");
        beachFlagImg.src = img;
        beachFlagImg.style.width = "40px";
        beachFlagImg.style.height = "40px";
        beachFlagImg.style.borderRadius = "5px";
        beachFlagImg.style.objectFit = "cover";
        beachFlagImg.style.margin = "3px";
        beachFlagImg.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.6)";
        bgMarker.appendChild(beachFlagImg);

        const pin = new PinElement({ 
            glyph: bgMarker,
            background: "#4285F4", 
            glyphColor: "white",
        });
        pin.element.style.cursor = "pointer";

        return new AdvancedMarkerElement({
            map,
            position,
            content: pin.element,
        });

    };

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

    followDropList(followId, followName) {
        const optionTag = document.createElement("li");
        optionTag.classList.add("option");
        optionTag.textContent = String(followName);
        optionTag.dataset.followId = followId;

        this.followOption.appendChild(optionTag);
        return optionTag;
    };

    async setHeadshotImg(img) {
        const headshot_obj = document.querySelector(".headshot-item-img");
        switch (img){
            case null:
                headshot_obj.src = "/static/img/user.png";
                break;
            default:
                headshot_obj.src = img;
        }
    };

    settingName(name) {
        const nameText = document.querySelector(".user-name");
        nameText.textContent = String(name);
    };
};

const indexV = new indexView();
export default indexV;
