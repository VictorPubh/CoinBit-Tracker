let targetPrice, bitcoinPrice;

const getBitcoinPrice = async () => {
    try {
        const apiKey = "AajzrY0eJDws1RmYJjKfSO42W160Rf0z7Sr8vFY2KbkqAWpeyd7xyRyJAjWQErZ3";
        const symbol = "BTCUSDT";
        const endpoint = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

        const response = await fetch(endpoint, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        const data = await response.json();

        return parseFloat(data.price);
    } catch ({ error, status }) {
        if (error) {
            return {
                error,
                status
            }
        }
    }
}

chrome.storage.sync.get("targetPrice", function (data) {
    targetPrice = data.targetPrice;
    fetchBitcoinPrice();
});

chrome.runtime.onInstalled.addListener(async () => {
    bitcoinPrice = await getBitcoinPrice();

    chrome.storage.sync.set({ targetPrice: 0 }, function () {
        targetPrice = 0;
        fetchBitcoinPrice();
    });
});

chrome.alarms.create("checkBitcoinPrice", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "checkBitcoinPrice") {
        fetchBitcoinPrice();
    }
});

const fetchBitcoinPrice = async () => {
    try {
        if (bitcoinPrice >= targetPrice) {
            chrome.action.setBadgeText({ text: "Alert!" });

            chrome.notifications.create({
                type: "basic",
                iconUrl: "images/icon16.png",
                title: "Alerta de Preço do Bitcoin",
                message: `O valor-alvo de U$ ${targetPrice} foi atingido! [U$ ${bitcoinPrice} = 0%]`,
            });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    } catch (error) {
        console.error(error);
    }
}
