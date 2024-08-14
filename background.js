const currentPair = "FTTUSDT";

let coinPrice;

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
    } catch ({ error, status }) {
        if (error) {
            return {
                error,
                status
            }
        }
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    coinPrice = await getCryptoPrice(currentPair);

    chrome.storage.sync.set({ targetPrice: 0 }, function () {
        targetPrice = 0;
        fetchCoinPrice();
    });
});

chrome.alarms.create("checkBitcoinPrice", { periodInMinutes: 0.05 });

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "checkBitcoinPrice") {
        fetchCoinPrice();
    }
});

function getPercentage(targetPrice, coinPrice) {
    const percent = ((coinPrice - targetPrice) / targetPrice) * 100;

    return (percent).toFixed(2);
}

const fetchCoinPrice = async () => {
    try {
        coinPrice = await getCryptoPrice(currentPair);

        chrome.storage.sync.get("targetPrice", ({ targetPrice }) => {
            chrome.storage.sync.get("targetDirection", ({ targetDirection }) => {
                if (targetDirection == "up") {
                    if (targetPrice > 0 && coinPrice >= targetPrice) {
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "images/icon16.png",
                            title: `Alerta: Preço de ${currentPair} caiu.`,
                            message: `O valor-alvo de U$ ${targetPrice} foi atingido! [U$ ${coinPrice} = ${getPercentage(targetPrice, coinPrice)}%]`,
                            buttons: [
                                {
                                    title: "Trocar",
                                },
                                {
                                    title: "Mutar",
                                },
                            ],
                        }, (notificationId) => {
                            chrome.notifications.onButtonClicked.addListener(function(notifId, btnIndex) {
                                if (notifId === notificationId) {
                                    if (btnIndex === 0) {
                                        chrome.tabs.create({ url: `https://www.binance.com/pt-BR/trade/${currentPair}?type=spot` });
                                    } else if (btnIndex === 1) {
                                        chrome.storage.sync.set({
                                            targetPrice: 0
                                        });
                                    }
                                }
                            });
                        });
                    }
                }

                if (targetDirection == "down") {
                    if (targetPrice > 0 && coinPrice <= targetPrice) {
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "images/icon16.png",
                            title: `Alerta: Preço de ${currentPair} caiu.`,
                            message: `O valor-alvo de U$ ${targetPrice} foi atingido! [U$ ${coinPrice} = ${getPercentage(targetPrice, coinPrice)}%]`,
                            buttons: [
                                {
                                    title: "Trocar",
                                },
                                {
                                    title: "Mutar",
                                },
                            ],
                        }, (notificationId) => {
                            chrome.notifications.onButtonClicked.addListener(function(notifId, btnIndex) {
                                if (notifId === notificationId) {
                                    if (btnIndex === 0) {
                                        chrome.tabs.create({ url: `https://www.binance.com/pt-BR/trade/${currentPair}?type=spot` });
                                    } else if (btnIndex === 1) {
                                        chrome.storage.sync.set({
                                            targetPrice: 0
                                        });
                                    }
                                }
                            });
                        });
                    }
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}
