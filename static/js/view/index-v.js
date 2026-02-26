class indexView {
    constructor() {
        this.countryOption = document.querySelector(".country-option");
        this.cityOption = document.querySelector(".city-option");
        this.typeOption = document.querySelector(".types-option");

    }

    async marker(map, position, title) {
    // 只有在執行到這行時，才會向 Google 請求載入 marker 函式庫
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        const bgMarker = document.createElement("button");
        bgMarker.classList.add("marker-btn");
        // bgMarker.style.appearance = "none";
        // bgMarker.style.width = "52px";
        // bgMarker.style.height = "52px";
        // bgMarker.style.backgroundColor = "#fff";
        // bgMarker.style.borderRadius = "5px";
        // bgMarker.style.overflow = "hidden";
        // bgMarker.style.cursor = "pointer";
        // bgMarker.style.position = "absolute";
        // bgMarker.style.zIndex = "5";
        const beachFlagImg = document.createElement("img");
        beachFlagImg.src = "./img/caffeine.jpg";
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
            title,
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
};

const indexV = new indexView();
export default indexV;
