const currentPair = "FTTUSDT";

const getCryptoPrice = async (symbol) => {
    try {
        const apiKey = "";
        const endpoint = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

        const response = await fetch(endpoint, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        const data = await response.json();

        return parseFloat(data.price);
    } catch ({ error, status }) {ð
        if (error) {
            return {
                error,
                status
            }
        }
    }
}

function getPercentage(targetPrice, coinPrice) {
    const percent = ((coinPrice - targetPrice) / targetPrice) * 100;

    return (percent).toFixed(2);
}

document.addEventListener("DOMContentLoaded", async () => {
    const targetPrice = document.getElementById("targetPrice");
    const currentPrice = document.getElementById("price");
    const radioButtons = document.querySelectorAll('input[name="direction"]');

    const targetValue = document.querySelector(".target");

    const percentButtons = document.querySelectorAll('.percent-button');
    const percentInput = document.querySelector('.percent-input');

    const spanPair = document.querySelector('span.pair')

    spanPair.textContent = currentPair;

    let selectedValue;

    chrome.storage.sync.get("targetPrice", ({ targetPrice }) => {
        targetValue.innerHTML = parseFloat(targetPrice);
    });

    chrome.storage.sync.get("targetDirection", ({ targetDirection }) => {
        if (parseFloat(targetValue.innerHTML) > 0) {
            if (targetDirection == "up") {
                targetValue.style.color = "#4CAF50";
            } else if(targetDirection == "down") {
                targetValue.style.color = "#ff5252";
            }
        }
    });

    const handleChange = () => {
        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                selectedValue = radioButton.value;
            }
        });

        if (selectedValue == "up") {
            percentButtons.forEach(button => {
                button.classList.remove('btn-red');
                button.classList.add('btn-green');
            });
        } else if (selectedValue === "down") {
            percentButtons.forEach(button => {
                button.classList.remove('btn-green');
                button.classList.add('btn-red');
            });
        }
    };

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', handleChange);
    });

    const bitcoinPrice = await getCryptoPrice(currentPair);

    const setPercentOnTarget = number => {
        const percent = parseFloat(number);

        let result;

        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                selectedValue = radioButton.value;
            }
        });

        if (selectedValue == "up") {
            result = bitcoinPrice + (bitcoinPrice * (percent / 100));
        } else {
            result = bitcoinPrice - (bitcoinPrice * (percent / 100));
        }

        targetPrice.value = (result || bitcoinPrice).toFixed(6);
    }

    currentPrice.innerHTML = bitcoinPrice;
    targetPrice.value = bitcoinPrice;

    document.getElementById("setPrice").addEventListener("click", () => {
        const targetPriceInput = document.getElementById("targetPrice");
        const targetPriceValue = parseFloat(targetPriceInput.value);

        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                selectedValue = radioButton.value;
            }
        });

        if (selectedValue == "up") {
            targetValue.style.color = "#4CAF50";
        } else {
            targetValue.style.color = "#ff5252";
        }

        targetValue.textContent = targetPriceInput.value;

        chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon16.png",
            title: `Novo Valor-Alvo!`,  
            message: `O valor-alvo de U$ ${targetPriceValue} foi definido para ${currentPair}!`,
        });

        chrome.storage.sync.set({
            targetPrice: targetPriceValue,
            targetDirection: selectedValue
        });
    });

    document.getElementById("getPrice").addEventListener("click", async () => {
        currentPrice.innerHTML = 0;

        const type = document.getElementById("type");
        const time = document.getElementById("time");

        try {
            const bitcoinPrice = await getCryptoPrice(currentPair);

            type.innerHTML = "U$"
            currentPrice.innerHTML = bitcoinPrice;
            currentPrice.style.color = "#4CAF50"
            time.innerHTML = "(Agora)"

            targetPrice.value = bitcoinPrice;
        } catch (err) {
            type.innerHTML = "HTTP"
            currentPrice.innerHTML = err.status || "400";
            currentPrice.style.color = "#ff5252"
            time.innerHTML = "(Error Code)"
        }
    });

    percentButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (percentInput.value == 0) percentInput.value = percent;

            setPercentOnTarget(button.textContent)
        });
    });

    percentInput.addEventListener('input', function () {
        if (percentInput.value === "") percentInput.value = 0;

        setPercentOnTarget(percentInput.value)
    });
});